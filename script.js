// ==== KONFIGURATION ====
const ICS_URL = "https://outlook.office365.com/owa/calendar/459e06915f20497b98e14dd8acc3693d@wela-suppen.de/fd3f98695c874fc58b0316b732d27f2412740084984941561009/calendar.ics";
const ROOM_NAME = "Raum Biergarten";
const REFRESH_SECONDS = 60;

// ==== FUNKTIONEN ====

// Zeigt die aktuelle Uhrzeit
function updateTime() {
    const timeElement = document.getElementById("time");
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString("de-DE");
}

// Lädt ICS-Daten und prüft, ob Raum belegt ist
async function updateRoomStatus() {
    const statusElement = document.getElementById("status");

    try {
        const response = await fetch(ICS_URL);
        const icsText = await response.text();

        // ICS parsen
        const events = parseICS(icsText);
        const now = new Date();

        let occupied = false;
        let nextEvent = null;

        for (const event of events) {
            const start = new Date(event.start);
            const end = new Date(event.end);

            if (now >= start && now <= end) {
                occupied = true;
            } else if (start > now && (!nextEvent || start < new Date(nextEvent.start))) {
                nextEvent = event;
            }
        }

        if (occupied) {
            statusElement.textContent = "RAUM BELEGT";
            statusElement.style.color = "red";
        } else if (nextEvent) {
            statusElement.textContent = `FREI → Nächster Termin: ${new Date(nextEvent.start).toLocaleTimeString("de-DE")}`;
            statusElement.style.color = "green";
        } else {
            statusElement.textContent = "FREI";
            statusElement.style.color = "green";
        }
    } catch (error) {
        statusElement.textContent = "Fehler beim Laden des Kalenders";
        statusElement.style.color = "orange";
        console.error(error);
    }
}

// Einfache ICS-Parser-Funktion
function parseICS(icsText) {
    const lines = icsText.split(/\r?\n/);
    const events = [];
    let event = null;

    for (const line of lines) {
        if (line.startsWith("BEGIN:VEVENT")) {
            event = {};
        } else if (line.startsWith("END:VEVENT")) {
            if (event) events.push(event);
            event = null;
        } else if (event) {
            if (line.startsWith("DTSTART")) {
                event.start = line.split(":")[1];
            } else if (line.startsWith("DTEND")) {
                event.end = line.split(":")[1];
            } else if (line.startsWith("SUMMARY")) {
                event.summary = line.split(":")[1];
            }
        }
    }

    return events;
}

// ==== INITIALISIERUNG ====
updateTime();
updateRoomStatus();

// Alle 60 Sekunden aktualisieren
setInterval(updateTime, 1000);
setInterval(updateRoomStatus, REFRESH_SECONDS * 1000);
