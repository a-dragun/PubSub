const { activeDates, today, daysToNextBonus } = window.streakData;

let current = new Date(today);
const todayISO = today.slice(0, 10);

const nextBonusDate = new Date(today);
nextBonusDate.setDate(nextBonusDate.getDate() + daysToNextBonus);
const nextBonusISO = nextBonusDate.toISOString().slice(0, 10);


function renderCalendar() {
    const y = current.getFullYear();
    const m = current.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    const startDay = (first.getDay() + 6) % 7;

    let html = `
    <div class="calendar-nav">
      <button onclick="prevMonth()">←</button>
       <span class="calendar-title">${current.toLocaleString("hr-HR", { month: "long", year: "numeric" })}</span>
       <button onclick="nextMonth()">→</button>
    </div>
    <div class="grid weekdays">
      ${["P", "U", "S", "Č", "P", "S", "N"].map(d => `<div>${d}</div>`).join("")}
    </div>
    <div class="grid">
  `;

    for (let i = 0; i < startDay; i++) {
        html += `<div class="empty"></div>`;
    }

    for (let d = 1; d <= last.getDate(); d++) {
        const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        let classes = "day";

        if (activeDates.includes(iso)) {
            classes += " active";
        }

        if (iso === todayISO && activeDates.includes(iso)) {
            classes += " today latest";
        }

        if (iso === nextBonusISO) {
            classes += " next-bonus";
        }

        html += `<div class="${classes}">${d}</div>`;
    }

    html += "</div>";
    document.getElementById("calendar").innerHTML = html;
}


function prevMonth() {
    current.setMonth(current.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    current.setMonth(current.getMonth() + 1);
    renderCalendar();
}


function closeStreak() {
    document.querySelector(".streak-backdrop").remove();
}

renderCalendar();
