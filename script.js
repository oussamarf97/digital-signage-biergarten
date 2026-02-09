// ==== KONFIGURATION ====
const ICS_URL = "https://outlook.office365.com/owa/calendar/459e06915f20497b98e14dd8acc3693d@wela-suppen.de/fd3f98695c874fc58b0316b732d27f2412740084984941561009/calendar.ics";
const ROOM_NAME = "Raum Biergarten";
const REFRESH_SECONDS = 60;

// ==== ELEMENTE AUS HTML ====
const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");

// ==== ZEIT ANZEIGEN ====
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
}

// ==== KALENDER DATEN ABRUFEN ====
async function fetchCalendar() {
    try {
        const response = await fetch(ICS_URL);
        const text = await response.text();
        return text;
    } catch (error) {
        console.error("Fehler beim Abrufen des Kalenders:", error);
        return null;
    }
}

// ==== ICS PARSEN UND STATUS BESTIMMEN ====
function parseICS(icsText) {
    if (!icsText) return "Fehler beim Laden";

    const lines = icsText.split("\n");
    const now = new Date();

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("BEGIN:VEVENT")) {
            let start = null;
            let end = null;

            while (!lines[i].startsWith("END:VEVENT")) {
                if (lines[i].startsWith("DTSTART")) {
                    start = new Date(lines[i].split(":")[1]);
                }
                if (lines[i].startsWith("DTEND")) {
                    end = new Date(lines[i].split(":")[1]);
                }
                i++;
            }

            if (start && end && now >= start && now <= end) {
                return "Raum belegt";
            }
        }
    }

    return "Raum frei";
}

// ==== STATUS AKTUALISIEREN ====
async function updateStatus() {
    const icsText = await fetchCalendar();
    const status = parseICS(icsText);
    statusEl.textContent = status;
}

// ==== AUTOMATISCHE UPDATES ====
updateTime();
updateStatus();
setInterval(updateTime, 1000); // Uhrzeit jede Sekunde aktualisieren
setInterval(updateStatus, REFRESH_SECONDS * 1000); // Status alle REFRESH_SECONDS aktualisieren
