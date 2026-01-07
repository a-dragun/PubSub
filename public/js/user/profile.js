document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("friendRequestForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      const confirmed = confirm("Jesi li siguran da želiš poslati zahtjev za prijateljstvo ovom korisniku?");
      if (!confirmed) {
        e.preventDefault();
      }
    });
  }

  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function (e) {
      const confirmed = confirm("Jeste li sigurni da želite izbrisati svoj račun?");
      if (!confirmed) {
        e.preventDefault();
        alert("Brisanje otkazano.");
      }
    });
  }

  document.getElementById('deleteFriendBtn')?.addEventListener('click', function(e){
      if (!confirm("Jeste li sigurni da ne želite ovog korisnika u popisu prijatelja?")) {
          e.preventDefault();
      }
  });
});
