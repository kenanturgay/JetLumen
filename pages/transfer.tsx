import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { signXDR, getFreighterAddress } from '../lib/freighter'
import StellarSdk from 'stellar-sdk'
import { callRecordTransfer } from '../lib/soroban'

type State = {
  total: string
  lastRecipient: string
}

export default function Transfer() {
  const router = useRouter()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [amount, setAmount] = useState('0.0001')
  const [recipient, setRecipient] = useState('GB...')
  const [state, setState] = useState<State>({ total: '0', lastRecipient: '' })

  useEffect(() => {
    const key = localStorage.getItem('jetlumen_publicKey')
    if (!key) router.push('/')
    else setPublicKey(key)
    fetchState()
  }, [])

  async function fetchState() {
    const res = await fetch('/api/state')
    const json = await res.json()
    setState({ total: json.total, lastRecipient: json.lastRecipient })
  }

  async function send() {
    try {
      // Build a dummy transaction XDR (we don't transfer XLM)
      // Try to get network details from Freighter if available, otherwise fall back to TESTNET
      let networkPassphrase = StellarSdk.Networks.TESTNET
      try {
        const freighter = (await import('@stellar/freighter-api')) as any
        const details = await (freighter.getNetworkDetails?.() ?? null)
        if (details?.networkPassphrase) networkPassphrase = details.networkPassphrase
      } catch (e) {
        console.debug('Could not load freighter network details, defaulting to TESTNET', e)
      }

      // Create a very small dummy operation: manage data
      const source = publicKey!
      const account = new StellarSdk.Account(source, '-1')
      const tx = new StellarSdk.TransactionBuilder(account, { fee: '100', networkPassphrase })
        .addOperation(StellarSdk.Operation.manageData({ name: 'jetlumen', value: `${recipient}:${amount}` }))
        .setTimeout(30)
        .build()

  // sign with Freighter using helper
  const signed = await signXDR(tx.toXDR(), source)
  console.log('Signed tx', signed)

      // If environment variables provided, attempt to call the real contract
      const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID
      if (contractId && process.env.NEXT_PUBLIC_SOROBAN_RPC) {
        // Attempt real contract call (placeholder helper)
        const result = await callRecordTransfer(contractId, source, recipient, amount)
        console.log('Contract call result', result)
        // Optionally you may still refresh state from a contract-read endpoint
      } else {
        // Fallback: Simulate calling the contract by hitting our API which updates JSON state
        const resp = await fetch('/api/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: source, recipient, amount })
        })
        const result = await resp.json()
        console.log('Transfer result', result)
        await fetchState()
      }
    } catch (e) {
      console.error('Send failed', e)
      alert('Send failed: ' + (e as Error).message)
    }
  }

  function disconnect() {
    localStorage.removeItem('jetlumen_publicKey')
    router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow w-[420px]">
        <h2 className="text-lg font-semibold mb-4">Send JetLumen (Simulation)</h2>
        <div className="mb-2">Connected: <span className="font-mono">{publicKey}</span></div>
        <label className="block">Amount (XLM)</label>
        <input className="w-full p-2 border rounded mb-2" value={amount} onChange={e=>setAmount(e.target.value)} />
        <label className="block">Recipient (Stellar Address)</label>
        <input className="w-full p-2 border rounded mb-4" value={recipient} onChange={e=>setRecipient(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={send} className="px-3 py-2 bg-green-600 text-white rounded">Send JetLumen</button>
          <button onClick={disconnect} className="px-3 py-2 bg-red-500 text-white rounded">Disconnect</button>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded">
          <div>Total simulated transferred: <strong>{state.total}</strong></div>
          <div>Last recipient: <strong className="font-mono">{state.lastRecipient}</strong></div>
        </div>
      </div>
    </main>
  )
}
