const navbar = document.getElementById('navbar');
let timeout;

document.addEventListener('mousemove', (e) => {
    clearTimeout(timeout);
    if (e.clientY < 100) {
        navbar.classList.add('show');
    } else {
        timeout = setTimeout(() => {
            navbar.classList.remove('show');
        }, 300);
    }
});