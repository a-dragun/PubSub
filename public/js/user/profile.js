document.getElementById('deleteBtn').addEventListener('click', function (e) {
  const confirmed = confirm("Jeste li sigurni da želite izbrisati svoj račun?");
  if (confirmed) {
    alert("Račun izbrisan.");
  } else {
    e.preventDefault();
    alert("Brisanje otkazano.");
  }
});