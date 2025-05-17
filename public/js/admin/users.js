document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const sortSelect = document.getElementById('sortSelect');

    const buildUrl = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (filterSelect.value) params.set('filter', filterSelect.value);
    if (sortSelect.value) params.set('sort', sortSelect.value);
    return '?' + params.toString();
    };

    searchInput.addEventListener('input', () => {
    clearTimeout(searchInput.debounce);
    searchInput.debounce = setTimeout(() => {
        window.location.href = buildUrl();
    }, 500);
    });

    filterSelect.addEventListener('change', () => {
    window.location.href = buildUrl();
    });

    sortSelect.addEventListener('change', () => {
    window.location.href = buildUrl();
    });

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