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
export declare function watchObject<T extends object>(object: T, options?: IWatchObjectOptions): {
    value: T;
    on: (callback: (newObject: T, changedProperty: string | symbol, newValue: unknown, oldValue: unknown) => void | Promise<void>, once?: boolean) => void;
    off: (callback: Function) => void;
    clean: () => void;
    onProperty: (property: keyof T, callback: ((newValue: unknown, oldValue: unknown, newObject: T, changedProperty: string | symbol) => void | Promise<void>) & {
        watchProperties?: (string | symbol)[];
    }, once?: boolean) => void;
};
export declare function h<K extends keyof HTMLElementTagNameMap>(tagName: K, properties?: Partial<Record<keyof HTMLElement, any>> & {
    attrs?: Record<string, string>;
    on?: Record<string | keyof HTMLElementEventMap, EventListenerOrEventListenerObject>;
    [k: string]: any;
}, children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node): HTMLElementTagNameMap[K];
export declare function rerender(viewContainer: HTMLElement, creator: () => HTMLElement | Node | string | (HTMLElement | Node | string)[]): HTMLElement;
