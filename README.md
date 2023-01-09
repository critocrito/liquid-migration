# `liquid-migration`

> Facilitate the VPN migration for Liquid Investigations.

## Installation

Install a recent version of the the Rust compiler (minimum 1.57). The recommended way to install Rust is by using [`rustup`](https://rustup.rs).

``` sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustc --version
```

Also setup the [Tauri](https://tauri.app) toolchain.

``` sh
cargo install tauri-cli
```

And install the [NodeJS compiler](https://nodejs.org/en/download/) and dependencies:

``` sh
cd liquid-migrations
npm install
```

During development run:

``` sh
cargo tauri dev
```

Build the production release using the following command:

``` sh
cargo tauri build
```

The binary can be found in `target/release`:

``` sh
ls -l target/release/liquid-migration
```

## Cross Compile using macOS targeting generic Linux systems using static binaries

To build a cross compiled static musl version using a macOS based system, e.g. targeting x86_64 (64bit linux) or x86 (32bit linux like Tails) run:

``` sh
# add rust x86_64 target
rustup target add x86_64-unknown-linux-musl
# add rust x86 target
rustup target add i686-unknown-linux-musl
# show possible options
brew options FiloSottile/musl-cross/musl-cross
# install with x86_64 target (default)
brew install FiloSottile/musl-cross/musl-cross
# (re)install with x86 target
brew reinstall FiloSottile/musl-cross/musl-cross --with-i486
# install cmake
brew install cmake
# compile target x86_64
TARGET_CC=x86_64-linux-musl-gcc CXX=x86_64-linux-musl-g++ PKG_CONFIG_SYSROOT_DIR=/ cargo -v build --release --target i686-unknown-linux-musl
# compile target x86
TARGET_CC=i486-linux-musl-gcc CXX=i486-linux-musl-g++ PKG_CONFIG_SYSROOT_DIR=/ cargo build --release --target i686-unknown-linux-musl
```

May take a while to complete and you may notice the cooling system of your silicon mac for the first time ;)
