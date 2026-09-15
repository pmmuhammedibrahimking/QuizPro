/**
 * Admin Panel Controller for QuizPro
 * Loads system stats, counts, active questions, pass rate, and user management.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure admin privileges smoothly
    if (!AuthManager.isAdmin()) {
        AuthManager.ensureAdminSession();
    }

    await loadAdminOverview();
});

async function loadAdminOverview() {
    let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
    let history = StorageHelper.getHistory();
    const questionsBank = StorageHelper.getQuestions();

    // Sync with API if available
    if (typeof API !== 'undefined' && API.getToken()) {
        const apiUsers = await API.getAdminUsers();
        if (apiUsers && apiUsers.success && Array.isArray(apiUsers.data)) {
            users = apiUsers.data;
        }
    }

    // Count total questions
    let totalQuestionsCount = 0;
    for (const cat in questionsBank) {
        if (Array.isArray(questionsBank[cat])) {
            totalQuestionsCount += questionsBank[cat].length;
        }
    }

    // Calculate Pass Rate
    let passes = 0;
    history.forEach(h => {
        const pct = h.percentage || (h.total ? Math.round((h.score / h.total) * 100) : 0);
        if (pct >= 50) passes++;
    });
    const passRate = history.length > 0 ? Math.round((passes / history.length) * 100) : 100;

    document.getElementById('admTotalUsers').innerText = users.length;
    document.getElementById('admTotalQuizzes').innerText = history.length;
    document.getElementById('admTotalQuestions').innerText = totalQuestionsCount;
    document.getElementById('admPassRate').innerText = passRate + '%';

    renderUsersTable(users);
}

function renderUsersTable(users) {
    const container = document.getElementById('admUsersList');
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 1.5rem 0;">No registered users found.</p>`;
        return;
    }

    container.innerHTML = users.map(u => {
        const isAdm = u.role === 'admin';
        return `
            <div class="history-item">
                <div>
                    <strong style="font-size: 1.05rem; display: block;">${StorageHelper.escapeHTML(u.name)}</strong>
                    <small style="color: var(--text-secondary);">${StorageHelper.escapeHTML(u.email)} | Dept: ${u.department || 'BCA'} | Reg: ${u.regNumber || 'N/A'}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="badge ${isAdm ? 'badge-admin' : 'badge-student'}">${isAdm ? 'Admin' : 'Student'}</span>
                    ${!isAdm ? `<button class="btn btn-danger btn-sm" onclick="deleteUserAccount('${u.id || u._id}')">Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function deleteUserAccount(userId) {
    if (!confirm('Are you sure you want to delete this user account?')) return;

    if (typeof API !== 'undefined' && API.getToken()) {
        await API.deleteUser(userId);
    }

    let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
    users = users.filter(u => (u.id !== userId && u._id !== userId));
    localStorage.setItem('quizUsers', JSON.stringify(users));

    loadAdminOverview();
}
