// URL zu deinem Outlook ICS-Kalender
const icsUrl = "https://outlook.office365.com/owa/calendar/459e06915f20497b98e14dd8acc3693d@wela-suppen.de/fd3f98695c874fc58b0316b732d27f2412740084984941561009/calendar.ics";
const refreshSeconds = 60; // alle 60 Sekunden aktualisieren

const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");

async function fetchCalendar() {
    try {
        const response = await fetch(icsUrl);
        const text = await response.text();
        return text;
    } catch (err) {
        console.error("Fehler beim Laden des Kalenders:", err);
        return null;
    }
}

function parseICS(icsData) {
    const events = [];
    const lines = icsData.split("\n");
    let currentEvent = null;

    lines.forEach(line => {
        line = line.trim();
        if (line === "BEGIN:VEVENT") {
            currentEvent = {};
        } else if (line === "END:VEVENT") {
            if (currentEvent) events.push(currentEvent);
            currentEvent = null;
        } else if (currentEvent) {
            if (line.startsWith("DTSTART")) {
                currentEvent.start = new Date(line.split(":")[1]);
            } else if (line.startsWith("DTEND")) {
                currentEvent.end = new Date(line.split(":")[1]);
            } else if (line.startsWith("SUMMARY")) {
                currentEvent.summary = line.split(":")[1];
            }
        }
    });

    return events;
}

function getRoomStatus(events) {
    const now = new Date();
    for (const event of events) {
        if (now >= event.start && now <= event.end) {
            return `Belegt: ${event.summary}`;
        }
    }
    return "Frei";
}

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
}

async function updateStatus() {
    updateTime();
    const icsData = await fetchCalendar();
    if (icsData) {
        const events = parseICS(icsData);
        const status = getRoomStatus(events);
        statusEl.textContent = status;
    } else {
        statusEl.textContent = "Kalender nicht verfügbar";
    }
}

// Initiales Update
updateStatus();

// Automatisch jede Minute aktualisieren
setInterval(updateStatus, refreshSeconds * 1000);
