# Deploy-config voor het puzzellab

Deze map bestaat om te voorkomen dat het lab ooit op de live site terechtkomt.

Het lab bouwt naar `deploy/lab/dist/` en wordt gedeployd met de `firebase.json`
in **deze** map. De root-`firebase.json` (die de twee live escape rooms serveert
vanuit de root-`dist/`) wordt daarbij nooit gelezen. Er is dus geen pad waarlangs
een lab-build de live site kan raken, en andersom.

Deployen doe je niet handmatig: push naar de branch `puzzle-lab`, dan doet
`.github/workflows/puzzle-lab.yml` het. Zie de root-README voor de URL.
