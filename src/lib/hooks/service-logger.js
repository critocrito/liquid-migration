import {useEffect} from "react";

export default (service, name) =>
  useEffect(() => {
    let i = 0;

    const subscription = service.subscribe((nextState) => {
      const {
        value,
        context,
        event,
        event: {type},
      } = nextState;

      // eslint-disable-next-line no-console
      if (name) console.groupCollapsed(`${name}: ${type} -> ${value} (${i})`);
      // eslint-disable-next-line no-console
      console.log(context, event);
      // eslint-disable-next-line no-console
      if (name) console.groupEnd();

      i += 1;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [service, name]);
