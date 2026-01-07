document.addEventListener('DOMContentLoaded', () => {
    const buildUrl = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    };
    const getQueryParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
    };

    const currentPage = parseInt(getQueryParam('page')) || 1;
    const pageLinks = document.querySelectorAll('.pagination a[href*="page="]');
    pageLinks.forEach(link => {
    const href = link.getAttribute('href');
    const match = href.match(/page=(\d+)/);
    if (match && parseInt(match[1]) === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
    });
});