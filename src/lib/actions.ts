import {invoke} from "@tauri-apps/api/tauri";

import {AppConfig, WireguardConfig} from "$lib/types";

export type ActionError = {
  type: "error";
  message: string;
};

export type ActionDelay = {
  type: "waiting";
  message?: string;
};

export type AppAction = {
  type: "success";
  project: string;
  vpn_server: {host: string; public_key: string};
  client: {ferm_config: string; wg_config: string};
};

export type HostAction = {
  type: "success";
};

type WireguardAction = {
  type: "success";
  public_key: string;
  private_key: string;
};

export type TemplatesAction = {
  type: "success";
};

export type AppActionMessage = AppAction | ActionError;
export type HostActionMessage = HostAction | ActionDelay | ActionError;
export type WireguardActionMessage = WireguardAction | ActionError;
export type TemplatesActionMessage = TemplatesAction | ActionError;

export const appAction = async (): Promise<AppConfig> => {
  const resp = await invoke<AppActionMessage>("app_config", {});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }

  return {
    project: resp.project,
    server: resp.vpn_server,
    client: resp.client,
  };
};

export const hostAction = async (): Promise<"ok" | "poll"> => {
  const resp = await invoke<HostActionMessage>("host_setup", {});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }

  if (resp.type === "waiting") {
    return "poll";
  }

  return "ok";
};

export const wireguardAction = async (): Promise<WireguardConfig> => {
  const resp = await invoke<WireguardActionMessage>("wg_keys", {});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }

  return {
    publicKey: resp.public_key,
    privateKey: resp.private_key,
  };
};

export const templatesAction = async (
  publicKey: string,
  privateKey: string,
): Promise<void> => {
  const resp = await invoke<TemplatesActionMessage>("templates", {
    privkey: privateKey,
    pubkey: publicKey,
  });

  if (resp.type === "error") {
    throw new Error(resp.message);
  }
};
