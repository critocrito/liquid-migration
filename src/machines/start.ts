import {actions, assign, createMachine, DoneInvokeEvent, send} from "xstate";

import {hostAction, patchingAction} from "$lib/actions";

const {choose} = actions;

type Context = {
  password: string;
  isHostReady: boolean;
  error?: string;
};
type Event =
  | {type: "STORE_PASSWORD"; password: string}
  | {type: "NEXT"}
  | {type: "FAIL"; error: string}
  | {type: "RESET"}
  | {type: "OK"}
  | {type: "POLL"};

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

    context: {password: "", isHostReady: false},

    states: {
      init: {
        entry: "resetPassword",
        on: {
          NEXT: {target: "password"},
        },
      },

      password: {
        on: {
          STORE_PASSWORD: {
            target: "hostIntermediary",
            actions: "assignPassword",
          },
        },
      },

      hostIntermediary: {
        on: {
          always: [{target: "verifyHost", cond: () => true}],
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
          OK: {target: "patchingSystem"},
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

      resetPassword: assign({
        password: () => "",
        isHostReady: () => false,
      }),

      assignPassword: assign({password: (_ctx, event) => event.password}),

      isPolling: assign({isHostReady: (_ctx, event) => event.data === "ok"}),

      pollHost: choose([
        {cond: (ctx) => ctx.isHostReady, actions: send("OK")},
        {actions: send("POLL", {delay: 1000})},
      ]),
    },

    services: {
      patchingSystem: async (ctx) => patchingAction(ctx.password),

      verifyHost: async (ctx) => hostAction(ctx.password),
    },
  },
);
