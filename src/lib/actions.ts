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

export type EmptyAction = {
  type: "success";
};

export type AppAction = {
  type: "success";
  project: string;
  server: {host: string; network: string; endpoint: string; public_key: string};
  client: {
    ferm_config: string;
    wg_config: string;
    unsafe_browser: string;
    cfg_dir: string;
  };
};

export type HostAction = {
  type: "success";
};

type WireguardAction = {
  type: "success";
  public_key: string;
  private_key: string;
};

type CachedIpAction = {
  type: "success";
  ip_address?: string;
};

export type AppActionMessage = AppAction | ActionError;
export type HostActionMessage = HostAction | ActionDelay | ActionError;
export type WireguardActionMessage = WireguardAction | ActionError;
export type CachedIpActionMessage = CachedIpAction | ActionError;
export type TemplatesActionMessage = EmptyAction | ActionError;
export type PatchingActionMessage = EmptyAction | ActionError;
export type DeleteStateActionMessage = EmptyAction | ActionError;

export const appAction = async (): Promise<AppConfig> => {
  const resp = await invoke<AppActionMessage>("app_config", {});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }

  return {
    project: resp.project,
    server: resp.server,
    client: resp.client,
  };
};

export const hostAction = async (password: string): Promise<"ok" | "poll"> => {
  const resp = await invoke<HostActionMessage>("host_setup", {password});

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

export const cachedIpAction = async (): Promise<string> => {
  const resp = await invoke<CachedIpActionMessage>("cached_ip", {});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }

  return resp.ip_address ?? "";
};

export const templatesAction = async (
  publicKey: string,
  privateKey: string,
  ipAddress: string,
): Promise<void> => {
  const resp = await invoke<TemplatesActionMessage>("templates", {
    privkey: privateKey,
    pubkey: publicKey,
    ipaddr: ipAddress,
  });

  if (resp.type === "error") {
    throw new Error(resp.message);
  }
};

export const patchingAction = async (password: string): Promise<void> => {
  const resp = await invoke<TemplatesActionMessage>("patch_system", {password});

  if (resp.type === "error") {
    throw new Error(resp.message);
  }
};

export const deleteStateAction = async (): Promise<void> => {
  const resp = await invoke<DeleteStateActionMessage>("delete_state");

  if (resp.type === "error") {
    throw new Error(resp.message);
  }
};
