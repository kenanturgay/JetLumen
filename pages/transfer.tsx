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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
    setLoading(true)
    setError(null)
    setSuccess(null)
    
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
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function disconnect() {
    localStorage.removeItem('jetlumen_publicKey')
    router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-black p-4">
      <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Send JetLumen</h2>
          <button 
            onClick={disconnect}
            className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Disconnect
          </button>
        </div>
        
        <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-sm text-blue-200">Connected Address</div>
          <div className="font-mono text-white text-sm truncate">{publicKey}</div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Amount (XLM)</label>
            <input 
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-white/30 outline-none transition-all"
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder="0.0001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Recipient Address</label>
            <input 
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-white/30 outline-none transition-all font-mono"
              value={recipient} 
              onChange={e => setRecipient(e.target.value)}
              placeholder="GABCD..."
            />
          </div>

          <button
            onClick={send}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     disabled:opacity-50 transition-all duration-200 transform 
                     hover:scale-[1.02] active:scale-[0.98] font-medium
                     disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending...</span>
              </div>
            ) : (
              'Send JetLumen'
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
              {success}
            </div>
          )}

          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-200">Total Transferred</span>
              <strong className="text-white">{state.total} XLM</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-200">Last Recipient</span>
              <strong className="text-white font-mono text-xs truncate ml-4">{state.lastRecipient}</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
