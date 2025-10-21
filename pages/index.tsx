import { useState } from 'react'
import { useRouter } from 'next/router'
import { connectFreighter } from '../lib/freighter'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function connect() {
    setLoading(true)
    try {
      const address = await connectFreighter()
      if (address) {
        localStorage.setItem('jetlumen_publicKey', address)
        router.push('/transfer')
      }
    } catch (e) {
      console.error('Connect failed', e)
      alert('Freighter connect failed. Make sure Freighter is installed and allowed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-black">
      <div className="p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-white bg-clip-text">JetLumen</h1>
          <p className="text-blue-200 mb-6 text-sm">Micro-remittance simulator (Stellar Soroban)</p>
          <button
            onClick={connect}
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 
                     transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                     font-medium shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Connecting...</span>
              </div>
            ) : (
              'Connect Freighter'
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
