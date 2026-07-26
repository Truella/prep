import { vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createChain(resolveValue: object): any {
	const promise = Promise.resolve(resolveValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const chain: any = {};
	chain.select = vi.fn(() => chain);
	chain.eq = vi.fn(() => chain);
	chain.single = vi.fn(() => chain);
	chain.order = vi.fn(() => chain);
	chain.update = vi.fn(() => chain);
	chain.insert = vi.fn(() => chain);
	chain.maybeSingle = vi.fn(() => chain);
	chain.upsert = vi.fn(() => chain);
	chain.then = promise.then.bind(promise);
	chain.catch = promise.catch.bind(promise);
	chain.finally = promise.finally.bind(promise);
	return chain;
}
