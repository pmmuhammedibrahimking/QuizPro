/**
 * Leaderboard Controller for QuizPro
 * Renders Top 3 Podium showcase, department filters, and search functionality.
 */

let allLeaderboardData = [];
let currentDeptFilter = 'All';

document.addEventListener('DOMContentLoaded', async () => {
    let data = StorageHelper.getLeaderboard();

    // Sync with API backend if available
    if (typeof API !== 'undefined' && API.getToken()) {
        const apiRes = await API.getLeaderboard();
        if (apiRes && apiRes.success && Array.isArray(apiRes.data)) {
            data = apiRes.data;
        }
    }

    // Default seed sample data if empty
    if (data.length === 0) {
        data = [
            { name: 'Alex Morgan', department: 'BCA', percentage: 100, score: 10, total: 10, category: 'Python', timeTaken: 95 },
            { name: 'David Miller', department: 'BSc', percentage: 90, score: 9, total: 10, category: 'DataStructures', timeTaken: 110 },
            { name: 'Sarah Jenkins', department: 'BCom CA', percentage: 85, score: 8, total: 10, category: 'DBMS', timeTaken: 125 },
            { name: 'Rahul Nair', department: 'BCA', percentage: 80, score: 8, total: 10, category: 'Java', timeTaken: 130 },
            { name: 'Priya Verma', department: 'BBA', percentage: 70, score: 7, total: 10, category: 'Accounting', timeTaken: 140 }
        ];
    }

    allLeaderboardData = data;
    renderLeaderboard();
});

function filterLeaderboard(dept, el) {
    currentDeptFilter = dept;
    const pills = el.parentElement.querySelectorAll('.dept-pill');
    pills.forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    renderLeaderboard();
}

function searchLeaderboard() {
    renderLeaderboard();
}

function renderLeaderboard() {
    const query = (document.getElementById('leaderSearchInput') ? document.getElementById('leaderSearchInput').value : '').toLowerCase();

    let filtered = allLeaderboardData;
    if (currentDeptFilter !== 'All') {
        filtered = filtered.filter(item => (item.department || '').toLowerCase() === currentDeptFilter.toLowerCase());
    }

    if (query) {
        filtered = filtered.filter(item => (item.name || '').toLowerCase().includes(query));
    }

    // Sort descending by percentage, then ascending by time taken
    filtered.sort((a, b) => {
        const pctA = a.percentage || Math.round((a.score / (a.total || 10)) * 100);
        const pctB = b.percentage || Math.round((b.score / (b.total || 10)) * 100);
        if (pctB !== pctA) return pctB - pctA;
        return (a.timeTaken || 0) - (b.timeTaken || 0);
    });

    renderPodium(filtered.slice(0, 3));
    renderTableList(filtered);
}

function renderPodium(top3) {
    const container = document.getElementById('podiumShowcase');
    if (!container) return;

    if (top3.length === 0) {
        container.innerHTML = '';
        return;
    }

    const first = top3[0];
    const second = top3[1];
    const third = top3[2];

    container.innerHTML = `
        ${second ? `
            <div class="podium-card podium-2 animate-scale-up">
                <div class="podium-crown">🥈</div>
                <strong style="display:block; font-size: 0.95rem;">${StorageHelper.escapeHTML(second.name)}</strong>
                <small style="color: var(--text-secondary);">${second.department || 'BCA'}</small>
                <div class="podium-score">${second.percentage || Math.round((second.score/(second.total||10))*100)}%</div>
            </div>
        ` : ''}

        ${first ? `
            <div class="podium-card podium-1 animate-scale-up">
                <div class="podium-crown">👑</div>
                <strong style="display:block; font-size: 1rem; color: var(--primary-color);">${StorageHelper.escapeHTML(first.name)}</strong>
                <small style="color: var(--text-secondary);">${first.department || 'BCA'}</small>
                <div class="podium-score" style="font-size: 1.2rem;">${first.percentage || Math.round((first.score/(first.total||10))*100)}%</div>
            </div>
        ` : ''}

        ${third ? `
            <div class="podium-card podium-3 animate-scale-up">
                <div class="podium-crown">🥉</div>
                <strong style="display:block; font-size: 0.95rem;">${StorageHelper.escapeHTML(third.name)}</strong>
                <small style="color: var(--text-secondary);">${third.department || 'BCA'}</small>
                <div class="podium-score">${third.percentage || Math.round((third.score/(third.total||10))*100)}%</div>
            </div>
        ` : ''}
    `;
}

function renderTableList(list) {
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem 0;">No student scores matching this department filter.</p>`;
        return;
    }

    container.innerHTML = list.map((item, idx) => {
        const pct = item.percentage || Math.round((item.score / (item.total || 10)) * 100);
        let badgeClass = 'badge-student';
        if (idx === 0) badgeClass = 'badge-admin';
        else if (idx < 3) badgeClass = 'badge-guest';

        return `
            <div class="history-item">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.2rem; font-weight: bold; width: 30px; text-align: center;">#${idx + 1}</span>
                    <div>
                        <strong style="font-size: 1.05rem; color: var(--text-primary); display: block;">${StorageHelper.escapeHTML(item.name)}</strong>
                        <small style="color: var(--text-secondary);">${item.department || 'BCA'} | Subject: ${item.category || 'General'}</small>
                    </div>
                </div>
                <div>
                    <span class="badge ${badgeClass}" style="font-size: 0.9rem;">${pct}%</span>
                </div>
            </div>
        `;
    }).join('');
}
