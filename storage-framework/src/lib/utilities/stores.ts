
// ##################################################
// inlined from 'svelte/internal':
// import { run_all, subscribe, noop, safe_not_equal, is_function, get_store_value } from 'svelte/internal';

export const noop = () => {};

export const safe_not_equal = (a, b) => a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');

// ##################################################

/** Callback to inform of a value updates. */
export type Subscriber<T> = (value: T) => void;

/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;

/** Callback to update a value. */
export type Updater<T> = (value: T) => T;

/** Cleanup logic callback. */
type Invalidator<T> = (value?: T) => void;

/** Start and stop notification callbacks. */
export type StartStopNotifier<T> = (set: Subscriber<T>) => Unsubscriber | void;

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;

	/**
	 * Get the current value
	 */
	get(this: void): T;
}

/** Writable interface for both updating and subscribing. */
export interface Writable<T> extends Readable<T> {
	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 */
	set(this: void, value: T): void;

	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 */
	update(this: void, updater: Updater<T>): void;
}

/** Pair of subscriber and invalidator. */
type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidator<T>];

const subscriber_queue = [];

/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
export const readable = <T>(value?: T, start?: StartStopNotifier<T>): Readable<T> => ({
		subscribe: writable(value, start).subscribe,
		get: () => value
	});

/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
export const writable = <T>(value?: T, start: StartStopNotifier<T> = noop): Writable<T> => {
	let stop: Unsubscriber;
	const subscribers: Set<SubscribeInvalidateTuple<T>> = new Set();

	const set = (new_value: T): void => {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) { // store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1]);
					}
					subscriber_queue.length = 0;
				}
			}
		}
	};

	const update = (fn: Updater<T>): void => {
		set(fn(value));
	};

	const subscribe = (run: Subscriber<T>, invalidate: Invalidator<T> = noop): Unsubscriber => {
		const subscriber: SubscribeInvalidateTuple<T> = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set) || noop;
		}
		run(value);

		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0) {
				stop();
				stop = null;
			}
		};
	};

	const get = (): T => value

	return { get, set, update, subscribe };
};