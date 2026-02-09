// ==== KONFIGURATION ====

// ICS-Kalender URL
const ICS_URL = "https://outlook.office365.com/owa/calendar/459e06915f20497b98e14dd8acc3693d@wela-suppen.de/fd3f98695c874fc58b0316b732d27f2412740084984941561009/calendar.ics";

// Raumname (optional, falls du mehrere Räume einbauen willst)
const ROOM_NAME = "Raum Biergarten";

// Aktualisierungsintervall in Sekunden
const REFRESH_SECONDS = 60;

// DOM-Elemente
const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");

// ==== FUNKTIONEN ====

// Zeigt die aktuelle Uhrzeit an
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
}

// ICS-Kalender laden
async function fetchCalendar() {
    try {
        const response = await fetch(ICS_URL);
        const icsText = await response.text();
        return icsText;
    } catch (err) {
        console.error("Fehler beim Laden des Kalenders:", err);
        return null;
    }
}

// ICS-Daten parsen
function parseICS(icsData) {
    const lines = icsData.split(/\r?\n/);
    const events = [];
    let event = null;

    lines.forEach(line => {
        line = line.trim();
        if (line === "BEGIN:VEVENT") {
            event = {};
        } else if (line === "END:VEVENT") {
            if (event) events.push(event);
            event = null;
        } else if (event) {
            if (line.startsWith("DTSTART")) {
                event.sta
