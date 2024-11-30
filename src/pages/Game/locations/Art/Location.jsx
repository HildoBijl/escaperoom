import { Image } from 'components'
import { ArtRoom } from 'assets'

import { cases } from '../../util'

export function Location({ numVisits }) {
	return cases(numVisits, [0, 2, 3, Infinity], [
		<>
			<p>Je loopt het kunstlokaal binnen. Oké, officieel heet het iets van culturele vorming ofzo, en wordt ook tekenen hier gegeven, maar iedereen noemt het lokaal gewoon &apos;kunst&apos;. Wel zo makkelijk. Zo te zien was er hier zojuist een schilderles; de schilderezels staan nog allemaal aan de rand van het lokaal. Enkelen bevatten nog schilderijen, waaronder een creatief zelfportret van de docent.</p>
			<Image src={ArtRoom} />
			<p>Achterin het lokaal is de deur naar de gang. Afgezien van de deur waar je door gekomen bent, is er geen andere uitgang. Wel valt het je op dat de deur naar de gang ook weer zo&apos;n vreemd elektronisch kastje heeft.</p>
		</>,
		<p>Het kunstlokaal met alle schilderezels staat er nog steeds net zo verlaten bij als voorheen.</p>,
		<p>Je bent weer in het kunstlokaal. Ietwat verveeld loop je naar het zelfportret van de docent. Je pakt een kwast, doopt hem in de zwarte inkt, en voegt met enkele artistieke zwaaien een snor toe aan het portret. Nou, met zo&apos;n snor zou hij er een stuk beter uitzien.</p>,
		<p>Het kunstlokaal is nog steeds leeg en levensloos, hoewel het zelfportret van de docent, met snor, je inmiddels wel wat oordelend aan begint te staren.</p>,
	])
}
