    document.addEventListener('DOMContentLoaded', function () {
      const input = document.getElementById('username');

      input.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
          event.preventDefault();
        }
      });

      input.addEventListener('paste', function(event) {
        const paste = (event.clipboardData || window.clipboardData).getData('text');
        if (paste.includes(' ')) {
          event.preventDefault();
        }
      });
    });

    function checkPassword() {
      const password = document.getElementsByName("password")[0].value;
      const passwordRepeat = document.getElementsByName("password_repeat")[0].value;
      const message = document.getElementById("message");

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