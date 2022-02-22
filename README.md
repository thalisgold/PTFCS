# Planungstool für Ladestationen in Münster

Das Planungs-Tool  bietet die Möglichkeit die Auswirkungen potentieller
Ladestationen auf den Bedarf an öffentlicher Ladeinfrastruktur in Münster zu modellieren. Ziel ist es,
Anwender*innen zu ermöglichen verschiedene Szenarien durchzuspielen um herauszufinden, was für
Arten von Ladestationen wo aufgestellt werden müssten, um den Ladebedarf Münsters möglichst gut
abzudecken.

## Aufbau des Tools
Es handelt sich um eine Web- und Open-Source-Anwendung, sodass es auch für
andere möglich ist das Tool zu verwenden oder sogar zu erweitern. Im Zentrum der Website ist
eine Leaflet-Karte von Münster zu sehen. Münster wird dabei in verschiedene Regionen
unterteilt und der zugehörige Ladebedarf der Regionen wird farblich codiert. Die/der Nutzer*in kann in die
Karte auf einen gewünschten Standort klicken, woraufhin sich ein Popup öffnet. Nun können die
Anzahl und Art der Ladestation sowie weitere Parameter zur Bestimmung des Einflussgebiets ausgewählt und abgeschickt werden. Das Programm berechnet
daraufhin wie sich der Ladebedarf der Regionen aufgrund der hinzugefügten Ladestation verändert.
Der Ladebedarf für die Regionen wird anschließend aktualisiert.
Das Tool beinhaltet Szenarien für die Jahre 2022, 2025 und 2030.

## Starten des Tools (lokal)
### Schritt 1
Klonen des Repositories:
```console
git clone https://github.com/thalisgold/PTFCS.git
```
Alternativ kann das Repository über GitHub-Desktop geklont werden.

### Schritt 2
Installieren der notwendigen ```node_modules```
```console
npm install
```

### Schritt 3
Starten der Web-Applikation
```console
npm start
```
Die Anwendung läuft anschließend über [http://localhost:3000/](http://localhost:3000/)
