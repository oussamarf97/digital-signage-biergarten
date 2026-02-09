const icsUrl = "https://outlook.office365.com/owa/calendar/459e06915f20497b98e14dd8acc3693d@wela-suppen.de/fd3f98695c874fc58b0316b732d27f2412740084984941561009/calendar.ics";
const roomName = "Raum Biergarten";
const refreshSeconds = 60;

// Uhrzeit aktualisieren
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById("time");
    timeElement.textContent = now.toLocaleTimeString();
}

// Raumstatus aus ICS-Datei prüfen
async function updateRoomStatus() {
    const statusElement = document.getElementById("status");
    try {
        const response = await fetch(icsUrl);
        const icsText = await response.text();

        const now = new Date();
        let occupied = false;

        // ICS-Datei parsen
        const events = icsText.split("BEGIN:VEVENT");
        for (let event of events) {
            const dtStartMatch = event.match(/DTSTART.*:(\d+)/);
            const dtEndMatch = event.match(/DTEND.*:(\d+)/);
            if (dtStartMatch && dtEndMatch) {
                const start = parseICSTime(dtStartMatch[1]);
                const end = parseICSTime(dtEndMatch[1]);
                if (now >= start && now <= end) {
                    occupied = true;
                    break;
                }
            }
        }

        statusElement.textContent = occupied ? "Raum belegt" : "Raum frei";
        statusElement.style.color = occupied ? "red" : "green";

    } catch (err) {
        statusElement.textContent = "Fehler beim Laden";
        statusElement.style.color = "orange";
        console.error(err);
    }
}

// Hilfsfunktion: ICS-Zeit in Date umwandeln
function parseICSTime(icsTime) {
    const year = parseInt(icsTime.slice(0, 4));
    const month = parseInt(icsTime.slice(4, 6)) - 1;
    const day = parseInt(icsTime.slice(6, 8));
    const hour = parseInt(icsTime.slice(9, 11));
    const minute = parseInt(icsTime.slice(11, 13));
    const second = parseInt(icsTime.slice(13, 15));
    return new Date(year, month, day, hour, minute, second);
}

// Interval starten
updateTime();
updateRoomStatus();
setInterval(() => {
    updateTime();
    updateRoomStatus();
}, refreshSeconds * 1000);
