document.addEventListener('DOMContentLoaded', () => {
  const roomId = document.body.dataset.roomId;
  const username = document.body.dataset.username;

  const socket = io();

  socket.emit('joinRoom', { roomId, username });

  socket.on('userListUpdated', (userList) => {
    const userListContainer = document.getElementById('user-list');
    userListContainer.innerHTML = '';

    userList.forEach((user) => {
      const div = document.createElement('div');
      div.className = 'user-card';
      div.innerHTML = `
        <div class="user-card-left">
          <img src="${user.profilePicture}" alt="pfp" />
          <div class="user-info">
            <strong>${user.name}</strong>
            ${user.adminLevel > 1 ? '<span class="admin">Admin</span>' : ''}
          </div>
        </div>
        <div><strong>${user.totalScore} bodova</strong></div>
      `;
      userListContainer.appendChild(div);
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

    if (isSystem) li.classList.add('message-system');
    if (isCorrect) li.classList.add('message-correct');

    if (isImageURL(message)) {
      li.innerHTML = `<strong>${sender}:</strong><br><img src="${message}" style="max-width: 100%; border-radius: 8px;" />`;
    } else {
      li.innerHTML = `<strong>${sender}:</strong> ${message}`;
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
    alert(`Izbačen si iz sobe od strane admina. Razlog: ${data.reason}`);
    socket.disconnect();
    window.location.href = '/';
  });

  const drawer = document.getElementById('drawer');
  const toggle = document.getElementById('drawer-toggle');

  toggle.addEventListener('click', () => {
    drawer.classList.toggle('closed');
    toggle.textContent = drawer.classList.contains('closed') ? '👥' : '❌';
  });
});
