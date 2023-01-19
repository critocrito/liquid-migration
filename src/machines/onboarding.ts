import {assign, createMachine, DoneInvokeEvent} from "xstate";

import {cachedIpAction, templatesAction, wireguardAction} from "$lib/actions";
import type {WireguardConfig} from "$lib/types";

type Context = {
  wireguardConfig?: WireguardConfig;
  ipAddress: string;
  error?: string;
};
type Event =
  | {type: "NEXT"}
  | {type: "STORE_IP"; ipAddress: string}
  | {type: "FAIL"; error: string}
  | {type: "RESET"};

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

        cachedIp: {
          data: string;
        };
      },
    },

    id: "onboarding",

    initial: "init",

    context: {ipAddress: ""},

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
            target: "cachedIp",
            actions: "assignWireguardConfig",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      cachedIp: {
        invoke: {
          src: "cachedIp",
          onDone: {
            target: "wireguard",
            actions: "assignIpAddress2",
          },
          onError: {
            target: "error",
            actions: "fail",
          },
        },
      },

      wireguard: {
        on: {
          NEXT: {target: "ipAddress"},
        },
      },

      ipAddress: {
        on: {
          STORE_IP: {
            target: "persisting",
            actions: "assignIpAddress",
          },
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

      assignIpAddress: assign({
        ipAddress: (_ctx, event) => event.ipAddress,
      }),

      assignIpAddress2: assign({
        ipAddress: (_ctx, event) => event.data,
      }),
    },

    services: {
      generateWireguard: wireguardAction,

      cachedIp: cachedIpAction,

      persistConfig: async (ctx) => {
        await templatesAction(
          ctx.wireguardConfig?.publicKey || "",
          ctx.wireguardConfig?.privateKey || "",
          ctx.ipAddress,
        );
      },
    },
  },
);
