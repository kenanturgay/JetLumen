Write-Host "Building Soroban contract..."
rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown
Write-Host "WASM should be in target/wasm32-unknown-unknown/release/"
