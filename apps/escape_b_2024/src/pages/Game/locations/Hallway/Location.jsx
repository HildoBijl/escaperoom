import { Image } from 'components'
import { HallWithChair } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

export function Location({ numVisits }) {
	return <Line text={numVisits === 0 ? 'Je lost het getallenrooster op' : 'Je gaat naar het geschiedenislokaal'}>
		{cases(numVisits, [0, 2, 3, Infinity], [
			<>
				<p>De deur naar de gang laat zich eindelijk openen! Je stapt de bekende gang in en gaat haast automatisch richting de aula. Bij binnenkomst in de grote hal valt je op dat er een grote groene bureaustoel op een tafel staat. Wat moet dat betekenen?</p>
				<Image src={HallWithChair} />
				<p>Zodra je dichterbij komt, schuiven als vanzelf alle stoelen en banken naar de zijkant van het lokaal, en de tafels naar het midden. Hoe kan dat ooit? Met magneten ofzo? Uiteindelijk merk je dat de tafels een patroon van zeven bij zeven hebben gevormd, met de bureaustoel nog steeds bovenop één van de tafels. Ook merk je dat de middelste tafel net zo groen is als de burealstoel.</p>
			</>,
			<p>Je bent terug in de aula. De tafels staan nog steeds in een groot grid van zeven bij zeven. Wat moet je ermee? En waar is die groene bureaustoel voor? Kun je hem een zetje geven? Of rolt hij dan van de tafels af?</p>,
			<p>Je kijkt nog eens goed naar de bureaustoel. Kun je hem misschien zo een zetje geven, dat hij niet van de tafels af rolt? Wat als er iets in de weg staat dat hem tegen houdt? En waar is die groene tafel in het midden voor?</p>,
			<p>De aula ziet er nog steeds uit als voorheen, met de tafels in een zeven-bij-zeven grid.</p>,
		])}
	</Line>
}
