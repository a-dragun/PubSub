document.addEventListener('DOMContentLoaded', function () {
  const usernameInput = document.getElementById('username');
  
  usernameInput.addEventListener('keydown', function(event) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  });

  usernameInput.addEventListener('paste', function(event) {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    if (paste.includes(' ')) {
      event.preventDefault();
    }
  });
});

function togglePasswordForm() {
  const form = document.getElementById('passwordForm');
  const newPasswordInput = document.getElementsByName('newPassword')[0];
  const repeatPasswordInput = document.getElementsByName('repeatPassword')[0];
  const message = document.getElementById('message');

  if (form.style.display === 'none') {
    form.style.display = 'block';
  clearance
  } else {
    form.style.display = 'none';
    newPasswordInput.value = '';
    repeatPasswordInput.value = '';
    message.textContent = '';
  }
}

function checkPassword() {
  const passwordForm = document.getElementById('passwordForm');
  const password = document.getElementsByName("newPassword")[0].value;
  const passwordRepeat = document.getElementsByName("repeatPassword")[0].value;
  const message = document.getElementById("message");

  if (passwordForm.style.display === 'none' || (!password && !passwordRepeat)) {
    message.textContent = '';
    return;
  }

  if (password.length < 8) {
    message.style.color = "orange";
    message.textContent = "Zaporka mora imati minimalno 8 znakova";
  } else if (password === passwordRepeat) {
    message.style.color = "green";
    message.textContent = "Zaporke se podudaraju!";
  } else {
    message.style.color = "red";
    message.textContent = "Zaporke se ne podudaraju!";
  }
}