document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.register-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementsByName("password")[0];
  const repeatInput = document.getElementsByName("password_repeat")[0];
  const message = document.getElementById("message");

  usernameInput.addEventListener('input', function () {
    if (usernameInput.value.length > 15) {
      usernameInput.value = usernameInput.value.substring(0, 15);
    }
  });

  usernameInput.addEventListener('keydown', function (event) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  });

  usernameInput.addEventListener('paste', function (event) {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    if (paste.includes(' ')) {
      event.preventDefault();
    }
  });

  form.addEventListener('input', checkPassword);

  form.addEventListener('submit', function (event) {
    const password = passwordInput.value.trim();
    const repeat = repeatInput.value.trim();

    if (password.length < 8 || password !== repeat) {
      event.preventDefault();
      message.style.color = "red";
      message.textContent = "Ispravite zaporku prije slanja obrasca.";
    }
  });

  function checkPassword() {
    const password = passwordInput.value.trim();
    const repeat = repeatInput.value.trim();

    if (!password && !repeat) {
      message.textContent = '';
      return;
    }

    if (password.length < 8) {
      message.style.color = "orange";
      message.textContent = "Zaporka mora imati minimalno 8 znakova";
    } else if (password === repeat) {
      message.style.color = "green";
      message.textContent = "Zaporke se podudaraju!";
    } else {
      message.style.color = "red";
      message.textContent = "Zaporke se ne podudaraju!";
    }
  }
});
