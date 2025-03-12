export declare enum STATUS {
    PENDING = "PENDING",
    FULFILLED = "FULFILLED",
    REJECTED = "REJECTED"
}
export type EmptyAble<T = unknown> = T | null | undefined | void;
export type OnFulfilled<Value = unknown, Result = unknown> = EmptyAble<(value: Value) => EmptyAble<Result>>;
export type OnRejected<Reason = unknown, Result = unknown> = EmptyAble<(reason: Reason) => EmptyAble<Result>>;
export type OnCompleted<T = unknown> = OnFulfilled<T> | OnRejected<T>;
export type Resolve<T = unknown> = (value: T) => void;
export type Reject = (reason?: unknown) => void;
export interface QueueTask {
    onFulfilled: OnFulfilled<any, any>;
    onRejected: OnRejected<any, any>;
    resolve: Resolve;
    reject: Reject;
}
export declare class OurPromise<T = unknown> {
    #private;
    constructor(executor: (resolve: Resolve<T>, reject: Reject) => void);
    then<TResult1 = T, TResult12 = never>(onFulfilled?: OnFulfilled<T, TResult1>, onRejected?: OnRejected<T, TResult12>): OurPromise<unknown>;
    catch<TResult = never>(onRejected?: OnRejected<T, TResult>): OurPromise<unknown>;
    finally(onCompleted: OnCompleted<T>): OurPromise<unknown>;
    static resolve<T>(value: T): OurPromise<T>;
    static reject<T>(value: T): OurPromise<T>;
    static all(): void;
    static allSettled(): void;
    static any(): void;
    static race(): void;
    static try(): void;
    static withResolvers<T = unknown>(): {
        promise: OurPromise<T>;
        resolve: Resolve<T>;
        reject: Reject;
    };
}
