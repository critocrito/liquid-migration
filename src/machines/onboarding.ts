import {createMachine} from "xstate";

type Context = Record<string, unknown>;
type Event = {type: "NEXT"};

export default createMachine({
  schema: {
    context: {} as Context,
    events: {} as Event,
  },
  id: "onboarding",

  initial: "init",

  context: {},

  states: {
    init: {
      on: {
        NEXT: {target: "wireguard"},
      },
    },

    wireguard: {
      on: {
        NEXT: {target: "ssl"},
      },
    },

    ssl: {
      on: {
        NEXT: {target: "other"},
      },
    },

    done: {
      type: "final",
    },
  },
});
