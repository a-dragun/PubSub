const actions = {
    users: [],
    questions: []
};

function updateSubmitButtonVisibility() {
    const btn = document.getElementById('submit-all-changes');
    if (actions.users.length === 0 && actions.questions.length === 0) {
        btn.style.display = 'none';
    } else {
        btn.style.display = 'block';
    }
}

document.querySelectorAll('.user-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const box = document.getElementById(`user-${id}`);
        const existingIndex = actions.users.findIndex(a => a.id === id);
        const alreadySelected = btn.classList.contains('selected');
        box.querySelectorAll('.user-action-btn').forEach(b => b.classList.remove('selected'));

        if (alreadySelected) {
            if (existingIndex !== -1) actions.users.splice(existingIndex, 1);
        } else {
            btn.classList.add('selected');
            if (existingIndex !== -1) actions.users.splice(existingIndex, 1);
            actions.users.push({ id, actionType: action });
        }

        updateSubmitButtonVisibility();
    });
});

document.querySelectorAll('.question-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const box = document.getElementById(`question-${id}`);
        const existingIndex = actions.questions.findIndex(a => a.id === id);
        const alreadySelected = btn.classList.contains('selected');
        box.querySelectorAll('.question-action-btn').forEach(b => b.classList.remove('selected'));

        if (alreadySelected) {
            if (existingIndex !== -1) actions.questions.splice(existingIndex, 1);
        } else {
            btn.classList.add('selected');
            if (existingIndex !== -1) actions.questions.splice(existingIndex, 1);
            actions.questions.push({ id, actionType: action });
        }

        updateSubmitButtonVisibility();
    });
});

function submitBulkChanges() {
    if (actions.users.length === 0 && actions.questions.length === 0) {
        alert("No changes selected.");
        return;
    }

    fetch("/admin/bulk_update", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert("Error: " + data.message);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const getQueryParam = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };
    const mutedPage = parseInt(getQueryParam('mutedPage')) || 1;
    const mutedLinks = document.querySelectorAll('.pagination a[href*="mutedPage"]');
    mutedLinks.forEach(link => {
        const href = link.getAttribute('href');
        const match = href.match(/mutedPage=(\d+)/);
        if (match && parseInt(match[1]) === mutedPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const bannedPage = parseInt(getQueryParam('bannedPage')) || 1;
    const bannedLinks = document.querySelectorAll('.pagination a[href*="bannedPage"]');
    bannedLinks.forEach(link => {
        const href = link.getAttribute('href');
        const match = href.match(/bannedPage=(\d+)/);
        if (match && parseInt(match[1]) === bannedPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const pendingPage = parseInt(getQueryParam('pendingPage')) || 1;
    const pendingLinks = document.querySelectorAll('.pagination a[href*="pendingPage"]');
    pendingLinks.forEach(link => {
        const href = link.getAttribute('href');
        const match = href.match(/pendingPage=(\d+)/);
        if (match && parseInt(match[1]) === pendingPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    updateSubmitButtonVisibility();
});