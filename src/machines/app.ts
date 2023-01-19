import {actions, assign, createMachine, DoneInvokeEvent, send} from "xstate";

import {appAction, deleteStateAction, hostAction} from "$lib/actions";
import type {AppConfig, ClientConfig, ServerConfig} from "$lib/types";

const {choose} = actions;

type Context = {
  project?: string;
  client?: ClientConfig;
  server?: ServerConfig;
  isHostReady: boolean;
  error?: string;
};

type Event =
  | {type: "POLL"}
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

    context: {isHostReady: false},

    predictableActionArguments: true,

    states: {
      loading: {
        invoke: {
          src: "loadConfig",
          onDone: {
            target: "verifyHost",
            actions: "setConfig",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      verifyHost: {
        invoke: {
          src: "verifyHost",
          onDone: {
            target: "pollHost",
            actions: "isPolling",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      pollHost: {
        entry: "pollHost",

        on: {
          POLL: {target: "verifyHost"},
          OK: {target: "loaded"},
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

      isPolling: assign({isHostReady: (_ctx, event) => event.data === "ok"}),

      pollHost: choose([
        {cond: (ctx) => ctx.isHostReady, actions: send("OK")},
        {actions: send("POLL", {delay: 1000})},
      ]),

      fail: assign({
        error: (_ctx, ev) => {
          const {data} = ev as DoneInvokeEvent<Error>;
          return data.message;
        },
      }),
    },

    services: {
      loadConfig: appAction,

      verifyHost: hostAction,

      deleteState: deleteStateAction,
    },
  },
);
