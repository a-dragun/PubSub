function toggleForm(formId) {
    const form = document.getElementById(formId);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

document.getElementById('deleteBtn').addEventListener('click', function (e) {
    const confirmed = confirm("Jeste li sigurni da želite izbrisati ovog korisnika?");
    if (!confirmed) {
    e.preventDefault();
    }
});

document.getElementById('updateAdminBtn').addEventListener('click', function (e) {
    const confirmed = confirm("Jeste li sigurni da želite promijeniti admin level ovog korisnika?");
    if (!confirmed) {
    e.preventDefault();
    }
});