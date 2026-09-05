document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.textContent = StorageHelper.getSettings().theme === 'dark' ? '☀️' : '🌙';
        themeBtn.addEventListener('click', () => {
            themeBtn.textContent = StorageHelper.toggleTheme() === 'dark' ? '☀️' : '🌙';
        });
    }

    function renderLeaderboard() {
        const leaderboard = StorageHelper.getLeaderboard();
        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';

        if (leaderboard.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No scores yet!</td></tr>';
            return;
        }

        leaderboard.forEach((entry, index) => {
            let rankIcon = index + 1;
            if (index === 0) rankIcon = '🥇';
            if (index === 1) rankIcon = '🥈';
            if (index === 2) rankIcon = '🥉';

            const tr = document.createElement('tr');
            tr.className = 'animate-fade-in';
            tr.style.animationDelay = `${index * 0.1}s`;
            tr.style.borderBottom = '1px solid var(--border-color)';
            
            tr.innerHTML = `
                <td style="padding: 1rem; font-weight: bold;">${rankIcon}</td>
                <td style="padding: 1rem;">${entry.name}</td>
                <td style="padding: 1rem;">${entry.category}</td>
                <td style="padding: 1rem; font-weight: bold; color: var(--primary-color);">${entry.score}/${entry.total}</td>
                <td style="padding: 1rem; color: var(--text-secondary);">${new Date(entry.date).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderLeaderboard();

    document.getElementById('reset-leaderboard').addEventListener('click', () => {
        if(confirm('Are you sure you want to reset the leaderboard? This cannot be undone.')) {
            localStorage.removeItem('quizLeaderboard');
            renderLeaderboard();
        }
    });
});
