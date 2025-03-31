export function getWorkerJsURL(workerScriptContent: string) {
  const blob = new Blob([workerScriptContent], {
    type: "application/javascript",
  });
  return URL.createObjectURL(blob);
}

export function throttle(
  fn: (...args: any[]) => any,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) {
  let timer: number | null;
  let previous = 0;
  const throttled = (...args: any[]) => {
    const now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    if (remaining < 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      previous = now;
      fn(...args);
    } else if (!timer && options.trailing !== false) {
      timer = window.setTimeout(() => {
        previous = options.leading === false ? 0 : new Date().getTime();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
  return throttled;
}

export function addCSS(
  cssText: string,
  styleId: string = `global-customer-css-${Date.now()}`,
  parent: ShadowRoot | Element | Document = document
) {
  const styleTag = document.createElement("style");
  styleTag.id = styleId;
  const content = document.createTextNode(cssText);
  styleTag.appendChild(content);
  if (parent === document) {
    parent.head.appendChild(styleTag);
  } else {
    parent.insertBefore(styleTag, parent.firstChild);
  }
  return styleTag;
}

export function removeCSS(
  styleIdOrDom: string | HTMLStyleElement,
  parent: ShadowRoot | Element | Document = document
) {
  if (typeof styleIdOrDom === "string") {
    const style = (parent === document ? parent.head : parent).querySelector(
      `#${styleIdOrDom}`
    );
    style?.remove();
  } else {
    styleIdOrDom?.remove?.();
  }
}

export function addClass(
  dom: string | HTMLElement,
  className: string | string[]
) {
  const classNames = Array.isArray(className) ? className : [className];
  const target = (
    typeof dom === "string" ? document.querySelector(dom) : dom
  ) as HTMLElement | null;
  if (!target) return;
  classNames.forEach((e) => {
    if (!target?.classList?.contains?.(e)) {
      target?.classList?.add?.(e);
    }
  });
}

export function removeClass(
  dom: string | HTMLElement,
  className: string | string[]
) {
  const classNames = Array.isArray(className) ? className : [className];
  const target = (
    typeof dom === "string" ? document.querySelector(dom) : dom
  ) as HTMLElement | null;
  if (!target) return;
  classNames.forEach((e) => {
    if (target?.classList?.contains?.(e)) {
      target.classList.remove(e);
    }
  });
}

export function toggleClass(
  dom: string | HTMLElement,
  className: string | string[]
) {
  const classNames = Array.isArray(className) ? className : [className];
  const target = (
    typeof dom === "string" ? document.querySelector(dom) : dom
  ) as HTMLElement | null;
  if (!target) return;
  classNames.forEach((e) => {
    if (target?.classList?.contains?.(e)) {
      target.classList.remove(e);
    } else {
      target?.classList?.add?.(e);
    }
  });
}

export function setCssVar(
  property: string,
  value: string | null,
  dom:
    | string
    | HTMLElement
    | (string | HTMLElement | undefined)[] = document.documentElement,
  priority?: string
) {
  if (!dom) {
    console.log(
      `[setCssVar ${property}: ${value} error] dom may not exist`,
      dom
    );
  }
  return (Array.isArray(dom) ? dom : [dom]).forEach((e) => {
    if (typeof e === "string") {
      document
        .querySelector<HTMLElement>(e)
        ?.style.setProperty(property, value, priority);
    } else {
      e?.style.setProperty(property, value, priority);
    }
  });
}

export interface IWatchObjectOptions {
  deep?: boolean;
  excludeType?: any[];
}

export type DeepFlatKeyOf<T> = T extends Record<string, any>
  ? {
      [k in keyof T]: k extends string
        ? T[k] extends Array<any>
          ? k
          : T[k] extends object
          ? T[k] extends HTMLElement
            ? k
            : T[k] extends CSSConditionRule
            ? k
            : T[k] extends AudioDestinationNode
            ? k
            : k | DeepFlatKeyOf<T[k]>
          : k
        : never;
    }[keyof T]
  : never;

export type DeepKeyOf<T> = T extends Record<string, any>
  ? {
      [k in keyof T]: k extends string
        ? T[k] extends Array<any>
          ? k
          : T[k] extends object
          ? T[k] extends HTMLElement
            ? k
            : T[k] extends CSSConditionRule
            ? k
            : T[k] extends AudioDestinationNode
            ? k
            : k | `${k}.${DeepKeyOf<T[k]>}`
          : k
        : never;
    }[keyof T]
  : never;

export function watchObject<T extends object>(
  object: T,
  options: IWatchObjectOptions = {
    deep: false,
  }
) {
  type ObjectChangedBaseEvent = (
    newObject: T,
    changedProperty: string | symbol,
    newValue: unknown,
    oldValue: unknown
  ) => void | Promise<void>;

  type ObjectChangedPropertyEvent = ((
    newValue: unknown,
    oldValue: unknown,
    newObject: T,
    changedProperty: string | symbol
  ) => void | Promise<void>) & { watchProperties?: (string | symbol)[] };

  type ObjectChangedEvent = ObjectChangedBaseEvent | ObjectChangedPropertyEvent;

  let events: ObjectChangedEvent[] = [];

  /**
   * internal parent object key
   */
  const internalParentKey = "__parentKey";

  function on(callback: ObjectChangedBaseEvent, once = false) {
    if (events.includes(callback)) {
      return;
    }
    if (once) {
      const wrapperOnce: ObjectChangedBaseEvent = (
        newObject: T,
        changedProperty: string | symbol,
        newValue: unknown,
        oldValue: unknown
      ) => {
        callback(newObject, changedProperty, newValue, oldValue);
        events = events.filter((e) => e !== wrapperOnce);
      };
      events.push(wrapperOnce);
      return;
    }
    events.push(callback);
  }

  function onProperty(
    property: DeepKeyOf<T>,
    callback: ObjectChangedPropertyEvent,
    once = false
  ) {
    const watchProperty: string | symbol =
      typeof property === "number" ? String(property) : property;
    if (!callback.watchProperties) {
      callback.watchProperties = [watchProperty];
    } else {
      callback.watchProperties.push(watchProperty);
    }
    if (events.includes(callback)) {
      return;
    }
    if (once) {
      const wrapperOnce: ObjectChangedPropertyEvent = (
        newValue: unknown,
        oldValue: unknown,
        newObject: T,
        changedProperty: string | symbol
      ) => {
        callback(newValue, oldValue, newObject, changedProperty);
        events = events.filter((e) => e !== wrapperOnce);
      };
      wrapperOnce.watchProperties = [watchProperty];
      events.push(wrapperOnce);
      return;
    }
    events.push(callback);
  }

  function onProperties(
    property: DeepKeyOf<T>[],
    callback: ObjectChangedPropertyEvent,
    once = false
  ) {
    property.forEach((p) => {
      onProperty(p, callback, once);
    });
  }

  function onChange(
    properties: DeepKeyOf<T> | DeepKeyOf<T>[],
    callback: ObjectChangedPropertyEvent,
    once = false
  ) {
    onProperties(
      Array.isArray(properties) ? properties : [properties],
      callback,
      once
    );
  }

  function off(callback: Function) {
    events = events.filter((e) => e !== callback);
  }

  function executeEvent(
    event: ObjectChangedEvent,
    fullKeyPath: string,
    p: string | symbol,
    target: T,
    newValue: any,
    oldValue: any
  ) {
    if (p === internalParentKey) {
      return;
    }
    if (!(event as ObjectChangedPropertyEvent).watchProperties) {
      (event as ObjectChangedBaseEvent)(target, p, newValue, oldValue);
    } else if (
      (event as ObjectChangedPropertyEvent).watchProperties?.includes(p)
    ) {
      (event as ObjectChangedPropertyEvent)(newValue, oldValue, target, p);
    }
  }

  const handler: ProxyHandler<any> = {
    get(target, p) {
      const value = Reflect.get(target, p);
      const inExcludeType = options.excludeType
        ? options.excludeType.some((TYPE) => value instanceof TYPE)
        : false;
      if (
        !options?.deep ||
        typeof value !== "object" ||
        value === null ||
        inExcludeType
      ) {
        return value;
      }

      const subProxy = new Proxy(value, handler);
      const parentKey = Reflect.get(target, internalParentKey) || "";
      console.debug("[[GET Object]]", target, parentKey, value);
      const fullKeyPath = [parentKey, p].filter(Boolean).join(".");
      Reflect.set(subProxy, internalParentKey, fullKeyPath);
      return subProxy;
    },
    set(target, p, newValue) {
      const oldValue = Reflect.get(target, p);
      if (oldValue === newValue) {
        return true;
      }
      const parentKey = Reflect.get(target, internalParentKey) || "";
      const fullKeyPath = [parentKey, p].filter(Boolean).join(".");
      console.debug("[[SET Object]]", target, fullKeyPath, newValue);
      Reflect.set(target, p, newValue);
      events.forEach((event) =>
        executeEvent(event, fullKeyPath, p, target, newValue, oldValue)
      );
      return true;
    },
    deleteProperty(target, p) {
      const oldValue = Reflect.get(target, p);
      const rs = Reflect.deleteProperty(target, p);
      const parentKey = Reflect.get(target, internalParentKey) || "";
      const fullKeyPath = [parentKey, p].filter(Boolean).join(".");
      events.forEach((event) =>
        executeEvent(event, fullKeyPath, p, target, void 0, oldValue)
      );
      return rs;
    },
    defineProperty(target, property, attributes) {
      const oldValue = Reflect.get(target, property);
      const rs = Reflect.defineProperty(target, property, attributes);
      const parentKey = Reflect.get(target, internalParentKey) || "";
      const fullKeyPath = [parentKey, property].filter(Boolean).join(".");
      events.forEach((event) =>
        executeEvent(
          event,
          fullKeyPath,
          property,
          target,
          attributes?.value || attributes?.get?.(),
          oldValue
        )
      );
      return rs;
    },
  };

  const proxy = new Proxy<T>(object, handler);

  function clean() {
    events = [];
  }

  return {
    value: proxy,
    on,
    off,
    clean,
    onProperty,
    onProperties,
    onChange,
    internalParentKey,
  };
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  properties?:
    | (Partial<Record<keyof HTMLElement, any>> & {
        attrs?: Record<string, string>;
        on?: Record<
          string | keyof HTMLElementEventMap,
          EventListenerOrEventListenerObject
        >;
        [k: string]: any;
      })
    | null,
  children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node
) {
  const container = document.createElement<K>(tagName);
  if (properties) {
    Object.entries(properties).forEach(([k, v]) => {
      if (k === "arrts" && typeof v === "object" && v !== null) {
        Object.entries(v as Record<string, string>).forEach(([ak, av]) => {
          container.setAttribute(ak, av);
        });
      } else if (k === "on" && typeof v === "object" && v !== null) {
        Object.entries(
          v as Record<string, EventListenerOrEventListenerObject>
        ).forEach(([ek, ev]) => {
          container.addEventListener(
            ek,
            typeof ev === "function"
              ? ev.bind(container)
              : {
                  ...ev,
                  handleEvent: ev.handleEvent.bind(container),
                }
          );
        });
      } else if (k === "style") {
        if (typeof v === "object" && v !== null) {
          Object.entries(v).forEach(([sk, sv]) => {
            Reflect.set(container.style, sk, sv);
          });
        } else if (typeof v === "string") {
          Reflect.set(container.style, "cssText", v);
        }
      } else if (k !== "arrts" && k !== "on" && k !== "style") {
        Reflect.set(container, k, v);
      }
    });
  }
  if (children) {
    container.append.apply(
      container,
      Array.isArray(children) ? children : [children]
    );
  }
  return container;
}

export function rerenderChildren(
  viewContainer: HTMLElement,
  childrenCreator: () =>
    | HTMLElement
    | Node
    | string
    | (HTMLElement | Node | string)[]
) {
  const next = childrenCreator();
  const nextArray = Array.isArray(next) ? next : [next];
  Array.from(viewContainer.childNodes).forEach((e) =>
    viewContainer.removeChild(e)
  );
  viewContainer.append.apply(viewContainer, nextArray);
  return viewContainer;
}

export function rerender(
  viewContainer: HTMLElement,
  options: {
    item: HTMLElement;
    render: () => HTMLElement;
  }[]
) {
  const result: HTMLElement[] = [];
  options.forEach((option) => {
    if (option.item.parentElement === viewContainer) {
      const next = option.render();
      viewContainer.insertBefore(next, option.item);
      option.item.remove();
      result.push(next);
    }
  });
  return result;
}
