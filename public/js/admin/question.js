document.getElementById('deleteBtn').addEventListener('click', function (e) {
    const confirmed = confirm("Jesi li siguran da želiš obrisati ovo pitanje?");
    if (!confirmed) {
    e.preventDefault();
    }
});

 if (question.status !== 'approved') {
    document.getElementById('approveBtn').addEventListener('click', function (e) {
        const confirmed = confirm("Jesi li siguran da želiš odobriti ovo pitanje?");
        if (!confirmed)
            e.preventDefault();
    })
};