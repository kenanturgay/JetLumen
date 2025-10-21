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
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">
        <h1 className="text-xl font-semibold mb-4">JetLumen</h1>
        <p className="mb-4">Micro-remittance simulator (Stellar Soroban)</p>
        <button onClick={connect} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Connecting...' : 'Connect Freighter'}
        </button>
      </div>
    </main>
  )
}
