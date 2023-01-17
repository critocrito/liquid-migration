import {assign, createMachine, DoneInvokeEvent} from "xstate";

import {patchingAction} from "$lib/actions";

type Context = {
  password?: string;
  error?: string;
};
type Event =
  | {type: "STORE_PASSWORD"; password: string}
  | {type: "NEXT"}
  | {type: "FAIL"; error: string}
  | {type: "RESET"};

export default createMachine(
  {
    tsTypes: {} as import("./start.typegen").Typegen0,

    predictableActionArguments: true,

    schema: {
      context: {} as Context,
      events: {} as Event,
      services: {} as {
        patchingSystem: {
          data: void;
        };
      },
    },

    id: "start",

    initial: "init",

    context: {},

    states: {
      init: {
        on: {
          NEXT: {target: "password"},
        },
      },

      password: {
        on: {
          STORE_PASSWORD: {
            target: "patchingSystem",
            actions: "assignPassword",
          },
        },
      },

      patchingSystem: {
        invoke: {
          src: "patchingSystem",
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

      assignPassword: assign({password: (_ctx, event) => event.password}),
    },

    services: {
      patchingSystem: async (ctx) => patchingAction(ctx.password || ""),
    },
  },
);
