// Helpers that load `@stellar/freighter-api` only on the client. This avoids
// SSR/build-time errors where the package may reference `window` at module
// scope. Each function does a dynamic import and handles errors clearly.

export async function connectFreighter(): Promise<string> {
  if (typeof window === 'undefined') throw new Error('connectFreighter must be called in the browser')
  try {
    const freighter = await import('@stellar/freighter-api')
    const { address, error } = await freighter.requestAccess()
    if (error) throw new Error(error)
    if (!address) throw new Error('No address returned from Freighter')
    return address
  } catch (e: any) {
    throw new Error('Freighter connect failed: ' + (e?.message || e))
  }
}

export async function getFreighterAddress(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const mod = (await import('@stellar/freighter-api')) as any
    const { getAddress } = mod
    const { address, error } = await getAddress()
    if (error) throw new Error(error)
    return address || null
  } catch (e: any) {
    console.error('getFreighterAddress failed', e)
    return null
  }
}

export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const mod = (await import('@stellar/freighter-api')) as any
    const { isConnected } = mod
    const res = await isConnected()
    return !!res?.isConnected
  } catch (e: any) {
    console.error('isFreighterAvailable check failed', e)
    return false
  }
}

export async function signXDR(xdr: string, address?: string): Promise<any> {
  if (typeof window === 'undefined') throw new Error('signXDR must be called in the browser')
  try {
    const mod = (await import('@stellar/freighter-api')) as any
    const { signTransaction } = mod
    const signed = await signTransaction(xdr, { network: 'TESTNET', address })
    return signed
  } catch (e: any) {
    throw new Error('Freighter signTransaction failed: ' + (e?.message || e))
  }
}
