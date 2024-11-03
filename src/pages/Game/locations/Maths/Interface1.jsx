import { getFactorization } from 'util'

export function Interface() {
	return <p>Hier komt de interface voor het kastje.</p>
}

function getNumPrimeFactors(num) {
	return getFactorization(num).reduce((sum, value) => sum + value, 0)
}
