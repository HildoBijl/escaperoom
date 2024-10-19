import { Link } from 'react-router-dom'
import { Subpage } from 'components'

export function About() {
	return <Subpage>
		<p>Hier vind je informatie over de achtergrond van deze Escape Room web-app, inclusief de actievoorwaarden rondom de prijzen.</p>
		<h2>Achtergrond en financiering</h2>
		<p>De stichting <Link to="https://www.vierkantvoorwiskunde.nl/">Vierkant voor Wiskunde</Link> organiseert al vanaf 1993 wiskundige activiteiten voor jongeren, inclusief verschillende zomerkampen. Om dit mooie initiatief te ondersteunen, hebben de <Link to="https://www.vierkantvoorwiskunde.nl/2023/10/uitbouw-van-de-vierkant-voor-wiskunde-zomerkampen/">bèta-vicedecanen van de Nederlandse universiteiten besloten</Link> een bijdrage toe te kennen ter uitbouwing van de zomerkampen.</p>
		<p>Om dit te faciliteren worden ook twintig gratis kampplekken weggegeven. Om deze kampplekken aan de juiste scholieren toegekend te krijgen is deze Escape Room opgezet. Kun jij alle raadsels oplossen en uit de Escape Room ontsnappen? Dan is een Vierkant-zomerkamp ook wel wat voor jou!</p>
		<h2>Prijzen en actievoorwaarden</h2>
		<p>De Escape Room is gericht op scholieren uit de onderbouw van de middelbare school. Zit jij in groep 8 van de basisschool, of in klas 1 of 2 van de middelbare school? Dan kun jij meedoen voor prijzen! (Voldoe je niet aan deze eisen? Dan kun je natuurlijk alsnog de Escape Room spelen, maar helaas niets winnen.)</p>
		<p>Om de prijs te winnen moet je uiterlijk [ToDo: voeg deadline toe] de Escape Room opgelost hebben en je gegevens achterlaten. Na de deadline trekt de Stichting Vierkant voor Wiskunde uit de lijst van oplossers (na een controle op geldigheid/dubbelen) willekeurig twintig winnaars. Deze winnaars worden dan uitgenodigd voor een gratis plek op het zomerkamp. Zit je bij de winnaars? Dan ontvang je hier uiterlijk [ToDo: voeg datum toe] Over de loting kan niet gecorrespondeerd worden.</p>
		<h2>Makers</h2>
		<p>Deze Escape Room is gemaakt door:</p>
		<ul>
			<li>Raadsels: Rianne Florijn en Daniël Kuckartz</li>
			<li>Programmering: Hildo Bijl</li>
		</ul>
		<p>Afbeeldingen zijn gegenereerd via DeepAI.</p>
	</Subpage>
}
