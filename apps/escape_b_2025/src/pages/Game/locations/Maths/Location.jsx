import { Image } from 'components'
import { MathsRoom } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

export function Location({ numVisits = 0 }) {
	return <Line text={numVisits === 0 ? 'Je lost het magische raam op' : 'Je gaat terug naar het wiskundelokaal'}>
		{cases(numVisits, [0, 3, 6, Infinity], [
			<>
				<p>Als de oplossing ingevoerd is hoor je een klik, en de deur zwaait automatisch open. Eindelijk! Je dacht even dat je tot de volgende dag vast zou zitten in het kantoor. De deur laat zich nu normaal openen, en je stapt terug het wiskundelokaal in.</p>
				<p>Het lokaal ziet er exact hetzelfde uit als toen je klas er nog was, behalve dan dat iedereen weg is. De tafels staan netjes in rijen door het lokaal, allen naar het schoolbord gericht, en de muren zijn nog steeds behangen met wiskundige posters.</p>
				<Image src={MathsRoom} />
				<p>Je oog gaat vooral uit naar de deuren. Tegenover je, in de verre muur, is de deur naar de gang, links is een tussendeur naar het muzieklokaal, en rechts kun je door naar geschiedenis. De tussendeuren kende je al, maar pas nu valt het je op dat ze ook allemaal een elektronisch kastje ernaast hebben. Zijn die nieuw? Of vallen ze je nu pas voor het eerst op?</p>
			</>,
			<p>Het wiskundelokaal is nog steeds hetzelfde als voorheen. Net zo verlaten als de rest van de school.</p>,
			<p>Het wiskundelokaal ziet er hetzelfde uit, maar het begint op je in te werken. De posters op de muren lijken dichterbij te komen.</p>,
			<p>Je denkt, &quot;Niet weer het wiskundelokaal...&quot; Je blijft hier maar terugkomen. Is het de centrale spil in deze hele situatie?</p>,
		])}
	</Line>
}
