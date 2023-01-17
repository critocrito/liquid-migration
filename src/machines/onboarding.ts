import {assign, createMachine, DoneInvokeEvent} from "xstate";

import {templatesAction, wireguardAction} from "$lib/actions";
import type {WireguardConfig} from "$lib/types";

type Context = {
  wireguardConfig?: WireguardConfig;
  error?: string;
};
type Event = {type: "NEXT"} | {type: "FAIL"; error: string} | {type: "RESET"};

export default createMachine(
  {
    tsTypes: {} as import("./onboarding.typegen").Typegen0,

    predictableActionArguments: true,

    schema: {
      context: {} as Context,
      events: {} as Event,
      services: {} as {
        persistConfig: {
          data: void;
        };
        wireguardConfig: {
          data: WireguardConfig;
        };
      },
    },

    id: "onboarding",

    initial: "init",

    context: {},

    states: {
      init: {
        on: {
          NEXT: {
            target: "generatingWireguard",
          },
        },
      },

      generatingWireguard: {
        invoke: {
          src: "generateWireguard",
          onDone: {
            target: "wireguard",
            actions: "assignWireguardConfig",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      wireguard: {
        on: {
          NEXT: {target: "persisting"},
        },
      },

      persisting: {
        invoke: {
          src: "persistConfig",
          onDone: {
            target: "done",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      done: {
        type: "final",
      },

      error: {
        on: {
          RESET: {target: "init"},
        },
      },
    },
  },
  {
    actions: {
      fail: assign({
        error: (_ctx, ev) => {
          const {data} = ev as DoneInvokeEvent<Error>;
          return data.message;
        },
      }),

      assignWireguardConfig: assign({
        wireguardConfig: (_ctx, ev) => {
          const {data} = ev as DoneInvokeEvent<WireguardConfig>;
          return data;
        },
      }),
    },

    services: {
      generateWireguard: wireguardAction,

      persistConfig: async (ctx) => {
        templatesAction(
          ctx.wireguardConfig?.publicKey || "",
          ctx.wireguardConfig?.privateKey || "",
        );
      },
    },
  },
);
