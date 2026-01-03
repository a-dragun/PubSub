const userColors = new Map();
const colorPalette = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
  '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
  '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];

function getColorForUser(username) {
  if (!userColors.has(username)) {
    const index = userColors.size % colorPalette.length;
    userColors.set(username, colorPalette[index]);
  }
  return userColors.get(username);
}


document.addEventListener('DOMContentLoaded', () => {
  const roomId = document.body.dataset.roomId;
  const username = document.body.dataset.username;

  const socket = io();

  socket.emit('joinRoom', { roomId, username });

  socket.on("levelUp", (data) => {
    console.log("Level Up Događaj Primljen:", data);
    openLevelUp({level: data.level, name: data.name, description: data.description, icon: data.icon, max_score: data.max_score, user_score: data.user_score});
});

socket.on('userListUpdated', (userList) => {
  const userListContainer = document.getElementById('user-list');
  userListContainer.innerHTML = '';

  const sortedUsers = userList.sort((a, b) => b.totalScore - a.totalScore);

  sortedUsers.forEach((user) => {
    const a = document.createElement('a');
    a.href = `/user/${user.id}`;
    a.className = 'user-card-link';
    const hasNextLevel = user.level && typeof user.level.maxScore === 'number' && user.level.maxScore > user.level.minScore;
    const progress = hasNextLevel ? Math.min(100, Math.max(0, ((user.totalScore - user.level.minScore) / (user.level.maxScore - user.level.minScore)) * 100)) : 100;

    a.dataset.tooltip = `
      <div class="tooltip-header">
        <img src="${user.profilePicture}" />
        <div>
          <div class="name">${user.name}</div>
          <div>${user.totalScore} bodova</div>
        </div>
      </div>

      <div class="tooltip-level">
        <img src="${user.level.icon}" />
        <div>
          <strong>${user.level.name}</strong><br>
          Level ${user.level.number}
        </div>
      </div>

      ${hasNextLevel ? `
        <div class="tooltip-progress-container">
          <div class="tooltip-progress-bar-bg">
            <div class="tooltip-progress-bar-fill" style="width:${progress.toFixed(2)}%"></div>
          </div>
          <div class="tooltip-progress-labels">
            <span>${user.level.minScore}</span>
            <span>${user.level.maxScore}</span>
          </div>
          <div class="tooltip-progress-text">
            ${Math.max(0, user.level.maxScore - user.totalScore)} bodova do sljedećeg levela
          </div>
        </div>
      ` : `
        <div class="tooltip-max-level">
          🏆 Maksimalni level
        </div>
      `}
    `;
      a.innerHTML = `
        <div class="user-card">
          <div class="user-card-left">
            <img src="${user.profilePicture}" alt="pfp" />
            <div class="user-info">
              <strong>${user.name}</strong>
              ${user.adminLevel > 1 ? '<span class="admin">Admin</span>' : ''}
            </div>
          </div>
          <div><strong>${user.totalScore} bodova</strong></div>
        </div>
      `;

      userListContainer.appendChild(a);
    });
  });


  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (msg !== '') {
      socket.emit('chatMessage', { roomId, message: msg, username });
      input.value = '';
    }
  });

  function isImageURL(url) {
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
  }

  socket.on('chatMessage', ({ username: sender, message, correct }) => {
    const li = document.createElement('li');
    const isSystem = sender === document.querySelector('header').textContent;
    const isCorrect = correct === true;
    const focusModeSwitch = document.getElementById('focus-mode-switch');

    if (isSystem) li.classList.add('message-system');
    if (isCorrect) li.classList.add('message-correct');

    if(focusModeSwitch.checked && !isSystem) {
      return;
    }

    if (isImageURL(message)) {
      li.innerHTML = `<strong style="color: ${color};">${sender}:</strong><br><img src="${message}" style="max-width: 100%; border-radius: 8px;" />`;
    } else {
      const color = getColorForUser(sender);
      li.innerHTML = `<strong style="color: ${color};">${sender}:</strong> ${message}`;
      if(!isSystem) {
        li.innerHTML += `<span class="report-flag" title="Prijavi poruku">🚩</span>`;
        const flag = li.querySelector('.report-flag');
        flag.addEventListener('click', () => {
          openReportModal(sender, message);
        });
      }
    }

    messages.appendChild(li);

    const img = li.querySelector('img');
    if (img) {
      img.onload = img.onerror = () => {
        messages.scrollTop = messages.scrollHeight;
      };
    } else {
      messages.scrollTop = messages.scrollHeight;
    }
  });

  socket.on('forceDisconnect', (data) => {
    alert(`Izbačen si iz sobe! Razlog: ${data.reason}`);
    socket.disconnect();
    window.location.href = '/';
  });

  socket.on('profanityWarning', (data) => {
    alert(data.message);
  });


  const drawer = document.getElementById('drawer');
  const toggle = document.getElementById('drawer-toggle');

  toggle.addEventListener('click', () => {
    drawer.classList.toggle('closed');
    toggle.textContent = drawer.classList.contains('closed') ? '👥' : '❌';
  });

  const tooltip = document.getElementById('user-tooltip');

document.addEventListener('mouseover', (e) => {
  const target = e.target.closest('.user-card-link');
  if (!target || !target.dataset.tooltip) return;

  tooltip.innerHTML = target.dataset.tooltip;
  tooltip.classList.add('visible');

  positionTooltip(e);
});

document.addEventListener('mousemove', (e) => {
  if (!tooltip.classList.contains('visible')) return;
  positionTooltip(e);
});

document.addEventListener('mouseout', (e) => {
  if (e.target.closest('.user-card-link')) {
    tooltip.classList.remove('visible');
  }
});

function positionTooltip(e) {
  const padding = 12;

  let x = e.clientX + padding;
  let y = e.clientY + padding;
  const rect = tooltip.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = e.clientX - rect.width - padding;
  }
  if (y + rect.height > window.innerHeight) {
    y = e.clientY - rect.height - padding;
  }

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}


});
