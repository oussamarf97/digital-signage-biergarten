// ====== KONFIGURATION ======
const ICS_URL = "https://outlook.office365.com/owa/calendar/459e06915f20497b98e14dd8acc3693d@wela-suppen.de/fd3f98695c874fc58b0316b732d27f2412740084984941561009/calendar.ics";
const ROOM_NAME = "Raum Biergarten";
const REFRESH_SECONDS = 60; // alle 60 Sekunden aktualisieren

const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");

// ====== ZEIT ANZEIGEN ======
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
}

// ====== ICS KALENDER LADEN ======
async function fetchCalendar() {
    try {
        const response = await fetch(ICS_URL);
        const text = await response.text();
        return text;
    } catch (error) {
        console.error("Fehler beim Laden des Kalenders:", error);
        return null;
    }
}

// ====== ICS PARSEN ======
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
                event.start = new Date(line.split(":")[1]);
            } else if (line.startsWith("DTEND")) {
                event.end = new Date(line.split(":")[1]);
            } else if (line.startsWith("SUMMARY")) {
                event.summary = line.split(":")[1];
            }
        }
    }
    return events;
}

// ====== RAUMSTATUS BESTIMMEN ======
function getRoomStatus(events) {
    const now = new Date();
    let nextEventTime = null;

    for (const event of events) {
        if (now >= event.start && now <= event.end) {
            return { text: `RAUM BELEGT: ${event.summary}`, color: "red" };
        } else if (event.start > now && (!nextEventTime || event.start < nextEventTime)) {
            nextEventTime = event.start;
        }
    }

    if (nextEventTime) {
        return { text: `FREI → Nächster Termin: ${nextEventTime.toLocaleTimeString("de-DE")}`, color: "green" };
    }

    return { text: "FREI", color: "green" };
}

// ====== STATUS AKTUALISIEREN ======
async function updateStatus() {
    updateTime();

    const icsData = await fetchCalendar();
    if (!icsData) {
        statusEl.textContent = "Kalender nicht verfügbar";
        statusEl.style.color = "orange";
        return;
    }

    const events = parseICS(icsData);
    const status = getRoomStatus(events);
    statusEl.textContent = status.text;
    statusEl.style.color = status.color;
}

// ====== INITIALISIERUNG ======
updateStatus();
setInterval(updateStatus, REFRESH_SECONDS * 1000);
setInterval(updateTime, 1000);
