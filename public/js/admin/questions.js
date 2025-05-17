document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');

    const buildUrl = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('pendingPage', '1');
    params.set('approvedPage', '1');
    if (searchInput.value.trim()) {
        params.set('search', searchInput.value.trim());
    } else {
        params.delete('search');
    }
    if (filterSelect.value) {
        params.set('filter', filterSelect.value);
    } else {
        params.delete('filter');
    }
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

    const getQueryParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
    };

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

    const approvedPage = parseInt(getQueryParam('approvedPage')) || 1;
    const approvedLinks = document.querySelectorAll('.pagination a[href*="approvedPage"]');
    approvedLinks.forEach(link => {
    const href = link.getAttribute('href');
    const match = href.match(/approvedPage=(\d+)/);
    if (match && parseInt(match[1]) === approvedPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
    });
});