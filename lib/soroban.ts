import { getPublicKey, signTransaction } from "@stellar/freighter-api";
import { 
  Server, 
  Networks, 
  TransactionBuilder, 
  Operation, 
  Asset, 
  BASE_FEE 
} from "stellar-sdk";

interface SwapData {
  initiator: string;
  counterparty: string;
  amountFrom: string;
  amountTo: string;
  expiration: number;
  completed: boolean;
}

const server = new Server("https://horizon-testnet.stellar.org");
let currentPublicKey: string | null = null;

export async function initialize(): Promise<string> {
  try {
    // First, check if Freighter is available in the browser
    if (typeof window === 'undefined') {
      throw new Error("Freighter is not available - browser environment required");
    }

    // Try to get the public key
    let publicKey: string | null = null;
    
    // First try getting from existing connection
    if (currentPublicKey) {
      try {
        const storedKey = await getPublicKey();
        if (storedKey && storedKey === currentPublicKey) {
          return currentPublicKey;
        }
      } catch (e) {
        // Ignore error and try new connection
      }
    }

    // Try to get a new public key
    try {
      publicKey = await getPublicKey();
    } catch (e) {
      throw new Error("Please unlock Freighter and try again");
    }

    if (!publicKey) {
      throw new Error("No wallet connected. Please connect Freighter wallet.");
    }

    // Update the current key and return
    currentPublicKey = publicKey;
    return publicKey;

  } catch (error) {
    console.error("Freighter initialization error:", error);
    const message = error instanceof Error ? error.message : "Failed to initialize wallet connection";
    throw new Error(message);
  }
}

async function submitTransaction(transaction: any) {
  try {
    const signedXDR = await signTransaction(transaction.toXDR(), Networks.TESTNET);
    const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
    return server.submitTransaction(tx);
  } catch (error) {
    console.error("Transaction submission failed:", error);
    throw error;
  }
}

async function createTransactionBuilder(source: string) {
  try {
    const account = await server.loadAccount(source);
    return new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    });
  } catch (error) {
    console.error("Failed to create transaction builder:", error);
    throw error;
  }
}

export async function recordTransfer(recipient: string, amount: string) {
  try {
    // Get the current public key if not already set
    const publicKey = currentPublicKey ?? await initialize();
    
    const builder = await createTransactionBuilder(publicKey);
    const transaction = builder
      .addOperation(Operation.payment({
        destination: recipient,
        asset: Asset.native(),
        amount: amount
      }))
      .setTimeout(30)
      .build();

    return submitTransaction(transaction);
  } catch (error) {
    console.error("Transfer failed:", error);
    throw new Error(error instanceof Error ? error.message : "Transfer failed");
  }
}

export async function createTimeLock(amount: string, unlockTime: number) {
  try {
    // Get the current public key if not already set
    const publicKey = currentPublicKey ?? await initialize();

    const builder = await createTransactionBuilder(publicKey);
    const transaction = builder
      .addOperation(Operation.setOptions({
        homeDomain: "jetlumen",
        signer: {
          ed25519PublicKey: publicKey,
          weight: 1
        }
      }))
      .setTimeout(30)
      .build();

    return submitTransaction(transaction);
  } catch (error) {
    console.error("TimeLock creation failed:", error);
    throw new Error(error instanceof Error ? error.message : "TimeLock creation failed");
  }
}

export async function createSwap(
  counterparty: string,
  amountFrom: string,
  amountTo: string,
  expiration: number
): Promise<{ hash: string }> {
  try {
    // Get the current public key if not already set
    const publicKey = currentPublicKey ?? await initialize();

    const builder = await createTransactionBuilder(publicKey);
    const transaction = builder
      .addOperation(Operation.setOptions({
        homeDomain: "jetlumen:swap",
        signer: {
          ed25519PublicKey: counterparty,
          weight: 1
        }
      }))
      .addOperation(Operation.manageData({
        name: "swap_details",
        value: `${amountFrom}:${amountTo}:${expiration}`
      }))
      .setTimeout(30)
      .build();

    const result = await submitTransaction(transaction);
    return { hash: result.hash };
  } catch (error) {
    console.error("Swap creation failed:", error);
    throw new Error(error instanceof Error ? error.message : "Swap creation failed");
  }
}

export async function getSwapDetails(swapId: string): Promise<SwapData> {
  try {
    const tx = await server.transactions().transaction(swapId).call();
    const operations = await server.operations().forTransaction(swapId).call();
    
    const swapDataOp = operations.records.find((op: any) => 
      op.type === "manage_data" && op.name === "swap_details"
    );
    
    if (!swapDataOp?.value) {
      throw new Error("Invalid swap transaction");
    }

    const [amountFrom, amountTo, expiration] = swapDataOp.value.split(":");
    const signerOp = operations.records.find((op: any) => 
      op.type === "set_options" && op.signer_key
    );

    return {
      initiator: tx.source_account,
      counterparty: signerOp?.signer_key || "",
      amountFrom,
      amountTo,
      expiration: parseInt(expiration),
      completed: tx.successful
    };
  } catch (error) {
    console.error("Failed to get swap details:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to get swap details");
  }
}
