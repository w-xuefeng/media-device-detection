export enum STATUS {
  PENDING = "PENDING",
  FULFILLED = "FULFILLED",
  REJECTED = "REJECTED",
}

export type EmptyAble<T = unknown> = T | null | undefined | void;
export type OnFulfilled<Value = unknown, Result = unknown> = EmptyAble<
  (value: Value) => EmptyAble<Result>
>;
export type OnRejected<Reason = unknown, Result = unknown> = EmptyAble<
  (reason: Reason) => EmptyAble<Result>
>;
export type OnCompleted<T = unknown> = OnFulfilled<T> | OnRejected<T>;

export type Resolve<T = unknown> = (value: T) => void;
export type Reject = (reason?: unknown) => void;

export interface QueueTask {
  onFulfilled: OnFulfilled<any, any>;
  onRejected: OnRejected<any, any>;
  resolve: Resolve;
  reject: Reject;
}

export class OurPromise<T = unknown> {
  #result: T | unknown;
  #status: STATUS = STATUS.PENDING;
  #queue: QueueTask[] = [];

  constructor(executor: (resolve: Resolve<T>, reject: Reject) => void) {
    const resolve = (result: T) => {
      this.#changeStatus(STATUS.FULFILLED, result);
    };
    const reject = (reason: unknown) => {
      this.#changeStatus(STATUS.REJECTED, reason);
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  static #isPromiseLike(promiseLike: any): promiseLike is OurPromise {
    return (
      ((typeof promiseLike === "object" && promiseLike !== null) ||
        typeof promiseLike === "function") &&
      typeof promiseLike.then === "function"
    );
  }

  #changeStatus(status: STATUS, result: T | unknown) {
    if (this.#status !== STATUS.PENDING) {
      return;
    }
    this.#status = status;
    this.#result = result;
    this.#run();
  }

  #handleTaskCallback(
    callback: OnFulfilled | OnRejected,
    resolve: Resolve,
    reject: Reject
  ) {
    if (typeof callback === "function") {
      queueMicrotask(() => {
        try {
          const rs = callback(this.#result);
          if (OurPromise.#isPromiseLike(rs)) {
            rs.then(resolve, reject);
          } else {
            resolve(rs);
          }
        } catch (error) {
          reject(error);
        }
      });
    } else {
      const settled = this.#status === STATUS.FULFILLED ? resolve : reject;
      settled(this.#result);
    }
  }

  #runOneTask(task?: QueueTask) {
    if (!task) {
      return;
    }
    const { onFulfilled, onRejected, resolve, reject } = task;
    if (this.#status === STATUS.FULFILLED) {
      this.#handleTaskCallback(onFulfilled, resolve, reject);
    } else if (this.#status === STATUS.REJECTED) {
      this.#handleTaskCallback(onRejected, resolve, reject);
    }
  }

  #run() {
    if (this.#status === STATUS.PENDING) {
      return;
    }
    while (this.#queue.length) {
      const task = this.#queue.shift();
      this.#runOneTask(task);
    }
  }

  then<TResult1 = T, TResult12 = never>(
    onFulfilled?: OnFulfilled<T, TResult1>,
    onRejected?: OnRejected<T, TResult12>
  ) {
    return new OurPromise((resolve, reject) => {
      this.#queue.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      });
      this.#run();
    });
  }

  catch<TResult = never>(onRejected?: OnRejected<T, TResult>) {
    return this.then(null, onRejected);
  }

  finally(onCompleted: OnCompleted<T>) {
    return this.then(onCompleted, onCompleted);
  }

  static resolve<T>(value: T) {
    if (this.#isPromiseLike(value)) {
      return value;
    }
    return new OurPromise<T>((resolve) => {
      resolve(value);
    });
  }
  static reject<T>(value: T) {
    if (this.#isPromiseLike(value)) {
      return value;
    }
    return new OurPromise<T>((_, reject) => {
      reject(value);
    });
  }
  static all() {
    // TODO
  }
  static allSettled() {
    // TODO
  }
  static any() {
    // TODO
  }
  static race() {
    // TODO
  }
  static try() {
    // TODO
  }
  static withResolvers<T = unknown>() {
    let resolve: Resolve<T> = () => {};
    let reject: Reject = () => {};
    const promise = new OurPromise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return {
      promise,
      resolve,
      reject,
    };
  }
}
