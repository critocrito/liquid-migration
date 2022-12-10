# `liquid-migration`

> Facilitate the VPN migration for Liquid Investigations.

## Installation

Install the Rust compiler. At least Rust 1.65.0 is required. The recommended way to install Rust is by using [`rustup`](https://rustup.rs).

``` sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustc --version
```

To build the production release run:

``` sh
cargo build --release
```

The binary can be found in `target/release`:

``` sh
ls -l target/release/liquid-migration
```

