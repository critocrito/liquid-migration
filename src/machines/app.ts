import {assign, createMachine, DoneInvokeEvent} from "xstate";

import {appAction, deleteStateAction} from "$lib/actions";
import type {AppConfig, ClientConfig, ServerConfig} from "$lib/types";

type Context = {
  project?: string;
  client?: ClientConfig;
  server?: ServerConfig;
  error?: string;
};

type Event =
  | {type: "OK"}
  | {type: "EDIT"}
  | {type: "SAVE"; config: AppConfig}
  | {type: "DELETE_STATE"}
  | {type: "CANCEL"}
  | {type: "FAIL"; error: string}
  | {type: "RESET"};

export default createMachine(
  {
    tsTypes: {} as import("./app.typegen").Typegen0,
    schema: {
      context: {} as Context,
      events: {} as Event,
      services: {} as {
        loadConfig: {
          data: AppConfig;
        };
        deleteState: {
          data: void;
        };
        verifyHost: {
          data: "ok" | "poll";
        };
      },
    },

    id: "app",

    initial: "loading",

    context: {},

    predictableActionArguments: true,

    states: {
      loading: {
        invoke: {
          src: "loadConfig",
          onDone: {
            target: "loaded",
            actions: "setConfig",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      loaded: {
        on: {
          EDIT: {target: "settings"},
        },
      },

      settings: {
        on: {
          SAVE: {target: "loaded"},
          CANCEL: {target: "loaded"},
          DELETE_STATE: {target: "confirmDeleteState"},
        },
      },

      confirmDeleteState: {
        on: {
          OK: {target: "deleteState"},
          CANCEL: {target: "settings"},
        },
      },

      deleteState: {
        invoke: {
          src: "deleteState",
          onDone: {
            target: "loading",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      error: {
        on: {
          RESET: {target: "loading"},
        },
      },
    },
  },
  {
    actions: {
      setConfig: assign((_ctx, event) => ({
        project: event.data.project,
        server: event.data.server,
        client: event.data.client,
      })),

      fail: assign({
        error: (_ctx, ev) => {
          const {data} = ev as DoneInvokeEvent<Error>;
          return data.message;
        },
      }),
    },

    services: {
      loadConfig: appAction,

      deleteState: deleteStateAction,
    },
  },
);
