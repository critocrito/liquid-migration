# App Config Config Format

The `app-config.json` is read at compile time and parameterizes the client to a specific investigative project. The `app-config.json.sample` can be used as a starting point. The config format has the following fields:

## General

- `project`: The name of the project.

## VPN Server

- `vpn_server.host` (required): The IPv4 Address of the VPN server.
- `vpn_server.public_key` (required): The Wireguard public key of the VPN server.

## Client

- `client.ferm_config` (optional): The path to the firewall config file on the Tails client. Defaults to `/etc/ferm/ferm.conf`.
- `client.wg_config` (optional): The path to the Wireguard config file on the Tails client. Defaults to `/etc/wireguard/wg0.conf`.
