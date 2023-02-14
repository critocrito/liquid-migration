# `liquid-migration`

> Facilitate the VPN migration for Liquid Investigations.

## Installation

To prepare the build environment start as root on a fresh Debian 11 installation:

```sh
apt update
apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    git-core
adduser build
```

Continue as the `build user`:

```sh
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustc --version

# Install node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
$SHELL   # Open a new shell to load nvm
nvm instll 16

# Get the source code, copy the ssh public key to the Github deploy keys
ssh-keygen -o -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "build@liquid-migration"

# Build the app
cargo install tauri-cli
git clone git@github.com:critocrito/liquid-migration.git
cd liquid-migration
npm install
cat <<EOF >> resources/app-config.json
> {
  "project": "E",
  "server": {
    "host": "10.0.11.1",
    "network": "10.0.11.0/24",
    "endpoint": "23.23.23.23",
    "public_key": "<pub key>"
  }
}
> EOF
cargo tauri build
```

The binary can be found in `target/release`:

```sh
ls -l src-tauri/target/release/bundle/app-image
```

## Development

To start the app during development run:

```sh
cargo tauri dev
```

There are various scripts that verify code quality:

- `npm run lint` : Check the code quality of the Typescript and Rust code.
- `npm run fix` : Fix any code quality issues that can be automated.
- `npm run watch` : Run various code quality checkers in watch mode.

## Cross Compile using macOS targeting generic Linux systems using static binaries

To build a cross compiled static musl version using a macOS based system, e.g. targeting x86_64 (64bit linux) or x86 (32bit linux like Tails) run:

```sh
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
