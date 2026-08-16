// getRandomInteger returns a random integer between (including) the given bounds.
export function getRandomInteger(min, max, exclude = []) {
	const num = Math.floor(min + (max + 1 - min) * Math.random())
	if (exclude.includes(num))
		return getRandomInteger(min, max, exclude)
	return num
}

// getRandomPermutation takes a number n and shuffles the numbers 0 to n-1 in a random order, returning them as list. So getRandomPermutation(5) may return [3,1,0,4,2].
export function getRandomPermutation(n) {
	const result = []
	const list = (new Array(n)).fill(0).map((_, i) => i)
	while (list.length > 0) {
		const i = getRandomInteger(0, list.length - 1)
		result.push(list[i])
		list.splice(i, 1)
	}
	return result
}

// mod is a function that (unlike Javascript) always returns on modulo a number between 0 (inclusive) and n (exclusive).
export function mod(a, n) {
	return ((a % n) + n) % n
}

// These are a few easing functions.
export const easeInOut = x => (x * x) / (2 * (x * x - x) + 1)
export const easeShift = x => x < 0.5 ? 2 * x ** 2 : 1 - 2 * (1 - x) ** 2
export const easeShiftSlow = x => x < 0.5 ? 4 * x ** 3 : 1 - 4 * (1 - x) ** 3

// getPrime returns the prime number at the given index.
const primes = [2, 3, 5, 7, 11]
export function getPrime(index) {
	while (index >= primes.length)
		addPrime()
	return primes[index]
}
function addPrime() {
	let n = primes[primes.length - 1] + 2
	while (!isPrime(n))
		n += 2
	primes.push(n)
}

// isPrime checks if a number is prime.
export function isPrime(num) {
	for (let i = 0; getPrime(i) ** 2 <= num; i++) {
		if (num % getPrime(i) === 0)
			return false
	}
	return true
}

// getFactorization returns the factorization of a prime number. For 20 = 2^2*3^0*5^1 it returns [2,0,1]. So it only returns an array of powers of prime numbers at the respective index.
export function getFactorization(num) {
	const factors = []
	for (let i = 0; num > 1; i++) {
		const p = getPrime(i)
		let count = 0
		while (num % p === 0) {
			count++
			num /= p
		}
		factors.push(count)
	}
	return factors
}

// findMinimumIndex returns the index of the lowest value of the list.
export function findMinimumIndex(list) {
	let index
	list.forEach((v, i) => {
		if (index === undefined || v < list[index])
			index = i
	})
	return index
}
