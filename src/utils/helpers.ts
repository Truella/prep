export function letterToIndex(letter: string): number {
	const map: Record<string, number> = {
		A: 0,
		B: 1,
		C: 2,
		D: 3,
	};
	return map[letter.toUpperCase()] ?? -1;
}
