#!/bin/bash
# Rust toolchain installation with specific version
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup default stable
rustup component add rustfmt
rustup component add clippy
cargo --version
