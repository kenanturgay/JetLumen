import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { signXDR, getFreighterAddress } from '../lib/freighter'
import * as soroban from '../lib/soroban'

type State = {
  total: string
  lastRecipient: string
}

type Mode = 'transfer' | 'timelock' | 'swap'

export default function Transfer() {
  const router = useRouter()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('transfer')
  
  // Transfer state
  const [amount, setAmount] = useState('0.0001')
  const [recipient, setRecipient] = useState('GB...')
  
  // TimeLock state
  const [unlockTime, setUnlockTime] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  )
  
  // Swap state
  const [swapAmountFrom, setSwapAmountFrom] = useState('0.0001')
  const [swapAmountTo, setSwapAmountTo] = useState('0.0001')
  const [counterparty, setCounterparty] = useState('GB...')
  const [swapExpiration, setSwapExpiration] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  )
  
  // UI state
  const [state, setState] = useState<State>({ total: '0', lastRecipient: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        // Check if Freighter is installed and available
        const isAvailable = await import('@stellar/freighter-api').then(mod => mod.isConnected())
        if (!isAvailable) {
          setError('Please install Freighter wallet extension')
          return
        }

        // Try to get the stored key or initialize a new connection
        let key = localStorage.getItem('jetlumen_publicKey')
        if (!key) {
          const newKey = await soroban.initialize()
          if (!newKey) {
            router?.push('/')
            return
          }
          localStorage.setItem('jetlumen_publicKey', newKey)
          key = newKey
        }

        setPublicKey(key)
        await fetchState()
      } catch (error) {
        console.error('Failed to initialize:', error)
        setError('Failed to initialize Freighter connection. Please make sure Freighter is unlocked.')
      }
    }
    
    init()
  }, [router])

  async function fetchState() {
    try {
      const res = await fetch('/api/state')
      if (!res.ok) throw new Error('Failed to fetch state')
      const json = await res.json()
      setState({ total: json.total, lastRecipient: json.lastRecipient })
    } catch (error) {
      console.error('Failed to fetch state:', error)
      setError('Failed to fetch state')
    }
  }

  async function handleContractCall() {
    await soroban.initialize()
    
    // Handle real contract calls
    switch (mode) {
      case 'transfer':
        return soroban.recordTransfer(recipient, amount)
      case 'timelock':
        return soroban.createTimeLock(amount, new Date(unlockTime).getTime())
      case 'swap':
        return soroban.createSwap(
          counterparty,
          swapAmountFrom,
          swapAmountTo,
          new Date(swapExpiration).getTime()
        )
      default:
        throw new Error('Invalid operation mode')
    }
  }

  async function handleAction() {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      if (!publicKey) throw new Error('Not connected')

      const result = await handleContractCall()
      console.log('Contract call result:', result)
      
      switch (mode) {
        case 'transfer':
          setSuccess('Transfer completed successfully')
          break
        case 'timelock':
          setSuccess('Time lock created successfully')
          break
        case 'swap':
          setSuccess(`Swap created successfully. ID: ${result.hash || 'Unknown'}`)
          break
      }

      await fetchState()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      console.error('Operation failed:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function disconnect() {
    try {
      localStorage.removeItem('jetlumen_publicKey')
      router?.push('/')
    } catch (error) {
      console.error('Failed to disconnect:', error)
      setError('Failed to disconnect')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-black p-4">
      <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">JetLumen</h2>
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

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setMode('transfer')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
              mode === 'transfer' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/5 text-blue-200 hover:bg-white/10'
            }`}
          >
            Transfer
          </button>
          <button
            onClick={() => setMode('timelock')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
              mode === 'timelock'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-blue-200 hover:bg-white/10'
            }`}
          >
            Time Lock
          </button>
          <button
            onClick={() => setMode('swap')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
              mode === 'swap'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-blue-200 hover:bg-white/10'
            }`}
          >
            Swap
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'transfer' && (
            <>
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
            </>
          )}

          {mode === 'timelock' && (
            <>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Amount to Lock (XLM)</label>
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
                <label className="block text-sm font-medium text-blue-200 mb-2">Unlock Time</label>
                <input 
                  type="datetime-local"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-white/30 outline-none transition-all"
                  value={unlockTime}
                  onChange={e => setUnlockTime(e.target.value)}
                />
              </div>
            </>
          )}

          {mode === 'swap' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">You Send (XLM)</label>
                  <input 
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-white/30 outline-none transition-all"
                    value={swapAmountFrom} 
                    onChange={e => setSwapAmountFrom(e.target.value)}
                    placeholder="0.0001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">You Receive (XLM)</label>
                  <input 
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-white/30 outline-none transition-all"
                    value={swapAmountTo} 
                    onChange={e => setSwapAmountTo(e.target.value)}
                    placeholder="0.0001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Counterparty Address</label>
                <input 
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-white/30 outline-none transition-all font-mono"
                  value={counterparty} 
                  onChange={e => setCounterparty(e.target.value)}
                  placeholder="GABCD..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Expiration Time</label>
                <input 
                  type="datetime-local"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-white/30 outline-none transition-all"
                  value={swapExpiration}
                  onChange={e => setSwapExpiration(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            onClick={handleAction}
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
                <span>Processing...</span>
              </div>
            ) : (
              {
                'transfer': 'Send JetLumen',
                'timelock': 'Create Time Lock',
                'swap': 'Create Swap'
              }[mode]
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
