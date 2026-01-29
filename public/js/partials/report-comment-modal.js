function openReportModal(commentId) {
    document.getElementById('reportCommentId').value = commentId;
    document.getElementById('reportModal').classList.add('active');
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('active');
    document.getElementById('reportForm').reset();
}

async function submitReport(event) {
    event.preventDefault();
    const commentId = document.getElementById('reportCommentId').value;
    const reason = document.getElementById('reportReason').value;

    try {
        const response = await fetch('/api/reports/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commentId, reason })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Komentar uspješno prijavljen.');
            closeReportModal();
        } else {
            alert(data.message || 'Došlo je do greške.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Došlo je do greške.');
    }
}
window.onclick = function (event) {
    if (event.target == document.getElementById('reportModal')) {
        closeReportModal();
    }
}
