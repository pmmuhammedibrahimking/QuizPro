/**
 * Commercial Student Portal & Examination Dashboard Controller for QuizPro
 * Manages Live Clock, Notifications, Extended Profile Modal, 8 Stat Metrics,
 * 2 HTML5 Canvas Analytics Charts, Subject Progress Cards, Recent Activity,
 * Top 5 Leaderboard preview, and Streak tracking.
 */

let currentDashDept = 'BCA';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let user = StorageHelper.getUser();
        if (!user) {
            if (typeof AuthManager !== 'undefined' && AuthManager.getCurrentUser()) {
                user = AuthManager.getCurrentUser();
            }
        }

        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        try { initLiveClock(); } catch (e) { console.warn('Clock init error:', e); }
        try { renderProStudentProfile(user); } catch (e) { console.warn('Profile render error:', e); }
        try { setupEditProfileForm(); } catch (e) { console.warn('Edit profile form error:', e); }
        
        try {
            await loadProDashboardStats();
        } catch (e) {
            console.warn('Dashboard stats load error:', e);
        }

        try { renderProDepartmentPills(user.department || 'BCA'); } catch (e) { console.warn('Pills render error:', e); }
        try { renderProSubjects(user.department || 'BCA'); } catch (e) { console.warn('Subjects render error:', e); }
        try { renderProLeaderboardPreview(); } catch (e) { console.warn('Leaderboard preview error:', e); }
    } catch (err) {
        console.error('Dashboard initialization error:', err);
    } finally {
        hideGlobalLoader();
    }
});

// 1. Live Header Real-Time Clock
function initLiveClock() {
    const clockEl = document.getElementById('liveHeaderClock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' | ' + now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        clockEl.innerText = formatted;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

// 2. Notification Bell Dropdown
function toggleNotificationDropdown() {
    const menu = document.getElementById('notifDropdownMenu');
    if (menu) menu.classList.toggle('show');
}

function clearNotifications() {
    const list = document.getElementById('notifItemsList');
    const count = document.getElementById('notifCount');
    if (list) list.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); text-align: center;">No new notifications.</p>`;
    if (count) count.style.display = 'none';
}

// Global click outside to dismiss notification dropdown
document.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-dropdown-container')) {
        const notifMenu = document.getElementById('notifDropdownMenu');
        if (notifMenu) notifMenu.classList.remove('show');
    }
});

// Global Escape key to dismiss notification dropdown
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const notifMenu = document.getElementById('notifDropdownMenu');
        if (notifMenu) notifMenu.classList.remove('show');
    }
});

// 3. Render Extended Student Profile Card
function renderProStudentProfile(user) {
    const avatar = document.getElementById('proAvatar');
    const name = document.getElementById('proStudentName');
    const reg = document.getElementById('proRegNo');
    const dept = document.getElementById('proDept');
    const sem = document.getElementById('proSemester');
    const college = document.getElementById('proCollege');
    const totalQ = document.getElementById('proTotalQuizzes');
    const rank = document.getElementById('proRank');
    const joined = document.getElementById('proJoinedDate');
    const sideName = document.getElementById('sidebarNavName');
    const sideDept = document.getElementById('sidebarNavDept');

    if (avatar) avatar.innerText = user.name ? user.name.charAt(0).toUpperCase() : '👤';
    if (name) name.innerText = user.name || 'Alex Morgan';
    if (reg) reg.innerText = user.regNumber || 'BCA2026042';
    if (dept) dept.innerText = user.department || 'BCA';
    if (sem) sem.innerText = user.semester || 'Semester VI';
    if (college) college.innerText = user.college || 'School of Computer Science';
    if (joined) joined.innerText = user.joinedDate || 'August 2025';
    if (sideName) sideName.innerText = user.name || 'Student Portal';
    if (sideDept) sideDept.innerText = (user.department || 'BCA') + ' Examination';

    const history = StorageHelper.getHistory();
    if (totalQ) totalQ.innerText = history.length;
}

// 4. Edit Profile Modal
function openEditProfileModal() {
    const user = StorageHelper.getUser();
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editRegNo').value = user.regNumber || '';
    document.getElementById('editDept').value = user.department || 'BCA';
    document.getElementById('editSemester').value = user.semester || 'Semester VI';
    document.getElementById('editCollege').value = user.college || 'School of Computer Science';

    document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

function setupEditProfileForm() {
    const form = document.getElementById('editProfileForm');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        const updated = {
            name: document.getElementById('editName').value.trim(),
            regNumber: document.getElementById('editRegNo').value.trim(),
            department: document.getElementById('editDept').value,
            semester: document.getElementById('editSemester').value.trim(),
            college: document.getElementById('editCollege').value.trim()
        };

        StorageHelper.saveUser(updated);
        renderProStudentProfile(StorageHelper.getUser());
        AuthManager.updateUI();
        closeEditProfileModal();
    };
}

// 5. Load 8 Metric Stats & Render Charts
async function loadProDashboardStats() {
    let history = StorageHelper.getHistory();
    let certs = StorageHelper.getCertificates();
    let badges = StorageHelper.getBadges();
    const user = StorageHelper.getUser();

    // Sync with API backend if available
    if (typeof API !== 'undefined' && API.getToken()) {
        const apiHistory = await API.getHistory();
        if (apiHistory && apiHistory.success && Array.isArray(apiHistory.data)) {
            history = apiHistory.data;
        }
    }

    const quizzesCount = history.length;
    let highest = 0;
    let totalPct = 0;
    let totalTimeSecs = user.totalTimeSpent || 0;

    history.forEach(item => {
        const pct = item.percentage || (item.total ? Math.round((item.score / item.total) * 100) : 0);
        if (pct > highest) highest = pct;
        totalPct += pct;
        totalTimeSecs += (item.timeTaken || 120);
    });

    const avgScore = quizzesCount > 0 ? Math.round(totalPct / quizzesCount) : 0;

    // Calculate Rank
    const leaderboard = StorageHelper.getLeaderboard();
    let rank = 1;
    if (leaderboard.length > 0) {
        const idx = leaderboard.findIndex(l => l.name === user.name);
        if (idx !== -1) rank = idx + 1;
    }

    // Format Total Time
    const hours = Math.floor(totalTimeSecs / 3600);
    const mins = Math.floor((totalTimeSecs % 3600) / 60);
    const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    // Populate 8 Cards
    document.getElementById('statQuizzesPro').innerText = quizzesCount;
    document.getElementById('statHighestScorePro').innerText = highest + '%';
    document.getElementById('statAvgScorePro').innerText = avgScore + '%';
    document.getElementById('statCertsPro').innerText = certs.length;
    document.getElementById('statRankPro').innerText = '#' + rank;
    document.getElementById('proRank').innerText = 'Rank #' + rank;
    document.getElementById('statTimeSpentPro').innerText = formattedTime;
    document.getElementById('statStreakPro').innerText = (user.streak || 5) + ' Days 🔥';
    document.getElementById('statBadgesPro').innerText = (badges.length || 4) + ' Badges';

    renderProRecentActivity(history);
    drawPerformanceTrendChart(history);
    drawSubjectAccuracyChart(history);
}

// 6. Canvas Chart 1: Performance Trend Line Graph
function drawPerformanceTrendChart(history) {
    const canvas = document.getElementById('trendChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const recent = history.slice(0, 6).reverse();
    if (recent.length === 0) {
        recent.push({ percentage: 70 }, { percentage: 85 }, { percentage: 90 }, { percentage: 95 });
    }

    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (graphHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Draw Trend Line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;

    const step = graphWidth / Math.max(1, recent.length - 1);
    recent.forEach((item, idx) => {
        const pct = item.percentage || Math.round((item.score / item.total) * 100) || 75;
        const x = padding + idx * step;
        const y = height - padding - (pct / 100) * graphHeight;

        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw Points
    recent.forEach((item, idx) => {
        const pct = item.percentage || Math.round((item.score / item.total) * 100) || 75;
        const x = padding + idx * step;
        const y = height - padding - (pct / 100) * graphHeight;

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${pct}%`, x, y - 10);
    });
}

// 7. Canvas Chart 2: Subject-Wise Accuracy Bar Graph
function drawSubjectAccuracyChart(history) {
    const canvas = document.getElementById('subjectChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const subjectsData = [
        { label: 'Python', pct: 90, color: '#6366f1' },
        { label: 'Java', pct: 80, color: '#ec4899' },
        { label: 'DBMS', pct: 85, color: '#10b981' },
        { label: 'DS', pct: 75, color: '#f59e0b' }
    ];

    const barWidth = 45;
    const spacing = (width - 60 - (subjectsData.length * barWidth)) / (subjectsData.length - 1);
    const maxBarHeight = height - 60;

    subjectsData.forEach((sub, idx) => {
        const x = 30 + idx * (barWidth + spacing);
        const barH = (sub.pct / 100) * maxBarHeight;

        ctx.fillStyle = sub.color;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, height - 35 - barH, barWidth, barH, [6, 6, 0, 0]);
        } else {
            ctx.rect(x, height - 35 - barH, barWidth, barH);
        }
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${sub.pct}%`, x + barWidth / 2, height - 40 - barH);
        ctx.fillText(sub.label, x + barWidth / 2, height - 15);
    });
}

// 8. Render Department Filter Pills & Subject Cards
function renderProDepartmentPills(selectedDept) {
    const group = document.getElementById('dashDeptPills');
    if (!group) return;

    const depts = ['BCA', 'BSc', 'BCom CA', 'BBA', 'BCom', 'General'];
    group.innerHTML = depts.map(d => `
        <button class="dept-pill ${d === selectedDept ? 'active' : ''}" onclick="selectProDept('${d}', this)">${d}</button>
    `).join('');

    renderProSubjects(selectedDept);
}

function selectProDept(dept, el) {
    currentDashDept = dept;
    const pills = document.querySelectorAll('#dashDeptPills .dept-pill');
    pills.forEach(p => p.classList.remove('active'));
    if (el) el.classList.add('active');
    renderProSubjects(dept);
}

function renderProSubjects(dept) {
    const grid = document.getElementById('proSubjectGrid');
    if (!grid) return;

    const subjects = DepartmentSubjects[dept] || DepartmentSubjects['BCA'];
    grid.innerHTML = subjects.map((sub, idx) => {
        const diff = idx % 3 === 0 ? 'Easy' : (idx % 3 === 1 ? 'Medium' : 'Hard');
        const diffBadge = diff === 'Easy' ? 'badge-student' : (diff === 'Hard' ? 'badge-admin' : 'badge-guest');

        return `
            <div class="feature-card animate-scale-up">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div class="feature-icon">📚</div>
                    <span class="badge ${diffBadge}">${diff}</span>
                </div>
                <h3>${sub}</h3>
                <button class="btn btn-primary btn-sm btn-block" style="margin-top: 1rem;" onclick="startQuizSubject('${sub}', '${dept}')">Start Assessment</button>
            </div>
        `;
    }).join('');
}

function startQuizSubject(subject, dept) {
    StorageHelper.saveQuizConfig({
        category: subject,
        department: dept,
        difficulty: 'all'
    });
    window.location.href = 'instructions.html';
}

function scrollToSubjects() {
    const sec = document.getElementById('subjectsSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
}

// 9. Render Recent Activity Feed
function renderProRecentActivity(history) {
    const container = document.getElementById('proActivityList');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 1.5rem 0;">No assessment attempts recorded yet. Click <strong>Take Quiz</strong> above to begin!</p>`;
        return;
    }

    container.innerHTML = history.slice(0, 5).map(item => {
        const pct = item.percentage || Math.round((item.score / item.total) * 100);
        const pass = pct >= 50;
        const formattedDate = new Date(item.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const mins = Math.floor((item.timeTaken || 120) / 60);
        const secs = (item.timeTaken || 120) % 60;

        return `
            <div class="history-item">
                <div>
                    <strong style="font-size: 1.05rem; display: block;">${item.category || 'General Quiz'}</strong>
                    <small style="color: var(--text-secondary);">${formattedDate} | Duration: ${mins}m ${secs}s | Score: ${item.score}/${item.total}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="badge ${pass ? 'badge-student' : 'badge-admin'}">${pct}% ${pass ? 'PASSED' : 'FAILED'}</span>
                    <button class="btn btn-secondary btn-sm" onclick="viewQuizAttemptResult('${encodeURIComponent(JSON.stringify(item))}')">Review</button>
                </div>
            </div>
        `;
    }).join('');
}

// 10. Render Top 5 Leaderboard Preview Widget
function renderProLeaderboardPreview() {
    const container = document.getElementById('proLeaderboardPreview');
    if (!container) return;

    const leaderboard = StorageHelper.getLeaderboard().slice(0, 5);
    if (leaderboard.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 1rem 0;">No scores available.</p>`;
        return;
    }

    container.innerHTML = leaderboard.map((item, idx) => {
        const pct = item.percentage || Math.round((item.score / (item.total || 10)) * 100);
        const crown = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-weight: bold; width: 24px;">${crown}</span>
                    <div>
                        <strong style="font-size: 0.95rem; display: block;">${StorageHelper.escapeHTML(item.name)}</strong>
                        <small style="color: var(--text-secondary);">${item.department || 'BCA'}</small>
                    </div>
                </div>
                <span class="badge badge-student">${pct}%</span>
            </div>
        `;
    }).join('');
}

// Global Filter Search
function filterDashboardContent() {
    const query = document.getElementById('globalSearchInput').value.toLowerCase();
    const subjectCards = document.querySelectorAll('#proSubjectGrid .feature-card');
    subjectCards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}

function openHelpCenterModal() {
    openModal('helpModal');
}

function openPrivacyModal() {
    openModal('privacyModal');
}

function closePrivacyModal() {
    closeModal('privacyModal');
}

function acknowledgePrivacyPolicy() {
    StorageHelper.acknowledgePrivacy();
    closePrivacyModal();
}

function viewQuizAttemptResult(encodedItem) {
    try {
        const item = JSON.parse(decodeURIComponent(encodedItem));
        localStorage.setItem('latestQuizResult', JSON.stringify(item));
        window.location.href = 'result.html';
    } catch(e) {
        window.location.href = 'result.html';
    }
}
