export type ServerConfig = {
  host: string;
  public_key: string;
};

export type ClientConfig = {
  ferm_config: string;
  wg_config: string;
};

export type AppConfig = {
  project: string;
  server: ServerConfig;
  client: ClientConfig;
};
