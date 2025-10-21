// Ambient module declarations to silence editor/TS errors for packages
// that may not provide types in this workspace yet.
declare module '@stellar/freighter-api'
declare module 'stellar-sdk'

// Simple process shim for frontend code checks (NEXT_PUBLIC_* usage)
declare var process: {
  env: {
    [key: string]: string | undefined
  }
}
