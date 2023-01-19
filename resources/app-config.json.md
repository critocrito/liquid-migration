# App Config Config Format

The `app-config.json` is read at compile time and parameterizes the client to a specific investigative project. The `app-config.json.sample` can be used as a starting point. The config format has the following fields:

## General

- `project`: The name of the project.

## Server

- `server.host` (required): The private IPv4 Address of the VPN server.
- `server.network` (required): The IPv4 CIDR of allowed IPs, e.g. 10.0.1.0/24.
- `server.endpoint` (required): The public IPv4 Address of the VPN endpoint.
- `server.public_key` (required): The Wireguard public key of the VPN server.
- `server.port` (optional): The port of the wireguard server. Defaults to 51820.

## Client

- `client.ferm_config` (optional): The path to the firewall config file on the Tails client. Defaults to `/etc/ferm/ferm.conf`.
- `client.wg_config` (optional): The path to the Wireguard config file on the Tails client. Defaults to `/etc/wireguard/wg0.conf`.
- `client.unsafe_browser` (optional): The path to the unsafe browser start script on the Tails client. Defaults to `/usr/local/sbin/unsafe-browser`.
- `client.cfg_dir` (optional): The path to the config directory on the client, where to store the generated templates. Defaults to `/home/amnesia/Persistent/.liquid`.
