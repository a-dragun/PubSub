let barInterval = null;
let fabInterval = null;
const socket = io();

function startBarTimer(endsAt) {
    clearInterval(barInterval);
    const timerEl = document.getElementById('hh-bar-timer');
    if (!timerEl) return;
    const tick = () => {
        const diff = new Date(endsAt) - new Date();
        if (diff <= 0) {
            clearInterval(barInterval);
            document.getElementById('hh-status-bar')?.classList.add('hidden');
            return;
        }
        const min = Math.floor(diff / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        timerEl.innerText = `${min}:${sec.toString().padStart(2, '0')}`;
    };
    tick();
    barInterval = setInterval(tick, 1000);
}

window.toggleHHModal = function() {
    const modal = document.getElementById('hh-modal');
    if (modal) modal.classList.toggle('hidden');
};

async function fetchHH() {
    const fab = document.getElementById('happy-hour-fab');
    const timerEl = document.getElementById('hh-timer');
    if (!fab) return;
    try {
        const res = await fetch('/api/happy-hour');
        const data = await res.json();
        handleStateChange(data); 
    } catch (err) {
        console.error("Greška pri dohvaćanju Happy Hour podataka:", err);
    }
}


function handleStateChange(data) {
    const fab = document.getElementById('happy-hour-fab');
    const timerEl = document.getElementById('hh-timer');
    
    clearInterval(fabInterval);
    if (data.isActive) {
        if (fab) fab.classList.add('active');
        const updateFabTick = () => {
            const diff = new Date(data.endsAt) - new Date();
            if (diff <= 0) {
                clearInterval(fabInterval);
                fab?.classList.remove('active');
                return;
            }
            const min = Math.floor(diff / 60000);
            const sec = Math.floor((diff % 60000) / 1000);
            if (timerEl) timerEl.innerText = `${min}:${sec.toString().padStart(2, '0')}`;
        };
        updateFabTick();
        fabInterval = setInterval(updateFabTick, 1000);
    } else {
        if (fab) fab.classList.remove('active');
        if (timerEl) timerEl.innerText = '';
    }
    updateModalButton(data);
}

function updateModalButton(data) {
    const btn = document.getElementById('hh-action-btn');
    const inputsContainer = document.getElementById('hh-inputs-container');
    if (!btn) return;

    btn.innerText = data.isActive ? 'STOPIRAJ' : 'AKTIVIRAJ';
    btn.className = data.isActive ? 'deactivate' : 'activate';
    btn.onclick = data.isActive ? stopHH : startHH;

    
    if (inputsContainer) {
        inputsContainer.style.display = data.isActive ? 'none' : 'block';
    }
}

async function startHH() {
    const durationInput = document.getElementById('hh-duration');
    const multiplierInput = document.getElementById('hh-multiplier');
    let duration = Math.floor(Math.abs(parseInt(durationInput.value)));
    let multiplier = Math.floor(Math.abs(parseInt(multiplierInput.value)));

    if (isNaN(duration) || duration < 1) duration = 30;
    if (isNaN(multiplier) || multiplier < 1) multiplier = 2;

    await fetch('/api/happy-hour/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: duration, multiplier: multiplier })
    });
    window.toggleHHModal();
}

async function stopHH() {
    await fetch('/api/happy-hour/deactivate', { method: 'POST' });
    window.toggleHHModal();
}

socket.on('happyHourUpdate', (data) => {
    const bar = document.getElementById('hh-status-bar');
    const multEl = document.getElementById('hh-bar-mult');
    
    if (data.isActive) {
        if (multEl) multEl.innerText = data.multiplier;
        if (bar) bar.classList.remove('hidden');
        startBarTimer(data.endsAt);
    } else {
        if (bar) bar.classList.add('hidden');
        clearInterval(barInterval);
    }
    
    handleStateChange(data);
});

document.addEventListener('DOMContentLoaded', () => {
    if (window.HH_INITIAL_DATA && window.HH_INITIAL_DATA.isActive) {
        const bar = document.getElementById('hh-status-bar');
        const multEl = document.getElementById('hh-bar-mult');
        if (bar) {
            bar.classList.remove('hidden');
            if (multEl) multEl.innerText = window.HH_INITIAL_DATA.multiplier;
            startBarTimer(window.HH_INITIAL_DATA.endsAt);
        }
    }
    const fab = document.getElementById('happy-hour-fab');
    if (fab) {
        fab.onclick = window.toggleHHModal;
        fetchHH(); 
    }
});