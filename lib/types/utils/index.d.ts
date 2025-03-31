export declare function getWorkerJsURL(workerScriptContent: string): string;
export declare function throttle(fn: (...args: any[]) => any, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): (...args: any[]) => void;
export declare function addCSS(cssText: string, styleId?: string, parent?: ShadowRoot | Element | Document): HTMLStyleElement;
export declare function removeCSS(styleIdOrDom: string | HTMLStyleElement, parent?: ShadowRoot | Element | Document): void;
export declare function addClass(dom: string | HTMLElement, className: string | string[]): void;
export declare function removeClass(dom: string | HTMLElement, className: string | string[]): void;
export declare function toggleClass(dom: string | HTMLElement, className: string | string[]): void;
export declare function setCssVar(property: string, value: string | null, dom?: string | HTMLElement | (string | HTMLElement | undefined)[], priority?: string): void;
export interface IWatchObjectOptions {
    deep?: boolean;
    excludeType?: any[];
}
export type DeepFlatKeyOf<T> = T extends Record<string, any> ? {
    [k in keyof T]: k extends string ? T[k] extends Array<any> ? k : T[k] extends object ? T[k] extends HTMLElement ? k : T[k] extends CSSConditionRule ? k : T[k] extends AudioDestinationNode ? k : k | DeepFlatKeyOf<T[k]> : k : never;
}[keyof T] : never;
export type DeepKeyOf<T> = T extends Record<string, any> ? {
    [k in keyof T]: k extends string ? T[k] extends Array<any> ? k : T[k] extends object ? T[k] extends HTMLElement ? k : T[k] extends CSSConditionRule ? k : T[k] extends AudioDestinationNode ? k : k | `${k}.${DeepKeyOf<T[k]>}` : k : never;
}[keyof T] : never;
export declare function watchObject<T extends object>(object: T, options?: IWatchObjectOptions): {
    value: T;
    on: (callback: (newObject: T, changedProperty: string | symbol, newValue: unknown, oldValue: unknown) => void | Promise<void>, once?: boolean) => void;
    off: (callback: Function) => void;
    clean: () => void;
    onProperty: (property: DeepKeyOf<T>, callback: ((newValue: unknown, oldValue: unknown, newObject: T, changedProperty: string | symbol) => void | Promise<void>) & {
        watchProperties?: (string | symbol)[];
    }, once?: boolean) => void;
    onProperties: (property: DeepKeyOf<T>[], callback: ((newValue: unknown, oldValue: unknown, newObject: T, changedProperty: string | symbol) => void | Promise<void>) & {
        watchProperties?: (string | symbol)[];
    }, once?: boolean) => void;
    onChange: (properties: DeepKeyOf<T> | DeepKeyOf<T>[], callback: ((newValue: unknown, oldValue: unknown, newObject: T, changedProperty: string | symbol) => void | Promise<void>) & {
        watchProperties?: (string | symbol)[];
    }, once?: boolean) => void;
    internalParentKey: string;
};
export declare function h<K extends keyof HTMLElementTagNameMap>(tagName: K, properties?: (Partial<Record<keyof HTMLElement, any>> & {
    attrs?: Record<string, string>;
    on?: Record<string | keyof HTMLElementEventMap, EventListenerOrEventListenerObject>;
    [k: string]: any;
}) | null, children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node): HTMLElementTagNameMap[K];
export declare function rerenderChildren(viewContainer: HTMLElement, childrenCreator: () => HTMLElement | Node | string | (HTMLElement | Node | string)[]): HTMLElement;
export declare function rerender(viewContainer: HTMLElement, options: {
    item: HTMLElement;
    render: () => HTMLElement;
}[]): HTMLElement[];
