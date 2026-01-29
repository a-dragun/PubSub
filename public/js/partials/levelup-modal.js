function openLevelUp({ name = "", description = "", icon = "", max_score = 0, user_score = 0 }) {
    const backdrop = document.querySelector(".levelup-backdrop");
    backdrop.classList.add("active");
    const iconEl = backdrop.querySelector("#levelup-icon");
    const nameEl = backdrop.querySelector(".level-name");
    const descEl = backdrop.querySelector(".level-description");
    const progressEl = backdrop.querySelector(".level-progress");

    if (iconEl) {
        iconEl.src = icon;
        iconEl.style.display = "block";
    }

    if (nameEl) nameEl.textContent = name;
    if (descEl) descEl.textContent = description;
    animateLevelProgress(user_score, max_score);
}

function closeLevelUp() {
    const backdrop = document.querySelector(".levelup-backdrop");
    backdrop.classList.remove("active");
}

function animateLevelProgress(user_score, max_score) {
    const fill = document.querySelector(".progress-bar-fill");
    const text = document.getElementById("progress-text");
    const leftLabel = document.getElementById("progress-left");
    const rightLabel = document.getElementById("progress-right");
    rightLabel.textContent = max_score;


    leftLabel.textContent = user_score < 200000 ? 0 : "";
    rightLabel.textContent = user_score < 200000 ? max_score + 1 : "";

    fill.style.width = "0%";

    setTimeout(() => {
        const percent = Math.min((user_score / max_score) * 100, 100);
        fill.style.width = percent + "%";
    }, 50);

    let currentScore = 0;
    const increment = Math.ceil(user_score / 60);
    const interval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= user_score) {
            currentScore = user_score;
            clearInterval(interval);
        }
        text.textContent = user_score < 200000 ? `Za napredak u sljedeći level trebaš skupiti još ${max_score + 1 - currentScore} bodova.` : `Dostigao si maksimalni level!`;
    }, 16);
}
