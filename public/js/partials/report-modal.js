const reportBackdrop = document.querySelector(".report-backdrop");
const reportPreview = reportBackdrop.querySelector(".report-preview");
const reportReasonInput = document.getElementById("report-reason");
let activeReport = null;

function openReportModal(reportedUsername, reportedMessage) {
    activeReport = { reportedUsername, reportedMessage };
    reportPreview.textContent = `"${reportedMessage}"`;
    reportReasonInput.value = '';
    reportBackdrop.classList.add('active');
}

document.getElementById("report-cancel-btn").onclick = () => {
    reportBackdrop.classList.remove('active');
    reportReasonInput.value = '';
};

document.getElementById("report-confirm-btn").onclick = async () => {
    const reason = reportReasonInput.value.trim();
    if (!reason) return alert("Unesi razlog prijave.");

    try {
        const res = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportedUsername: activeReport.reportedUsername,
                reportedMessage: activeReport.reportedMessage,
                reason
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("Prijava poslana!");
        reportBackdrop.classList.remove('active');
        reportReasonInput.value = '';
    } catch (err) {
        alert(err.message || "Greška pri slanju prijave.");
    }
};
