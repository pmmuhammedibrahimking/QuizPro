document.addEventListener('DOMContentLoaded', () => {
    const user = StorageHelper.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Theme setup
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.textContent = StorageHelper.getSettings().theme === 'dark' ? '☀️' : '🌙';
        themeBtn.addEventListener('click', () => {
            themeBtn.textContent = StorageHelper.toggleTheme() === 'dark' ? '☀️' : '🌙';
        });
    }

    // User info display
    document.getElementById('user-info').innerHTML = `
        <div class="profile-banner">
            <div class="profile-avatar">
                ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.8rem;">${user.name}</h3>
                <p style="margin: 0; opacity: 0.9;"><strong>Reg No:</strong> ${user.regNumber} | <strong>Dept:</strong> ${user.department}${user.email ? ` | <strong>Email:</strong> ${user.email}` : ''}</p>
            </div>
        </div>
    `;
    
    // Remove the inline styles from the user-info container itself since we use banner now
    document.getElementById('user-info').style = "";

    // Handle Delete Profile
    const deleteProfileBtn = document.getElementById('delete-account-btn');
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', () => {
            if(confirm('Are you sure you want to completely delete your profile and all history? This cannot be undone.')) {
                // Wipe their history
                let globalHistory = StorageHelper.getHistory();
                globalHistory = globalHistory.filter(h => h.user.regNumber !== user.regNumber);
                localStorage.setItem('quizHistory', JSON.stringify(globalHistory));
                
                // Wipe their leaderboard entries
                let leaderboard = StorageHelper.getLeaderboard();
                leaderboard = leaderboard.filter(l => l.name !== user.name);
                localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
                
                // Remove active user session
                localStorage.removeItem('currentUser');
                
                // Redirect to home
                window.location.href = 'index.html';
            }
        });
    }

    let history = StorageHelper.getHistory();
    const userHistory = history.filter(h => h.user.regNumber === user.regNumber);
    
    function renderDashboard() {
        history = StorageHelper.getHistory();
        const currentUserHistory = history.filter(h => h.user.regNumber === user.regNumber);

        // Stats calculation
        document.getElementById('total-attempts').textContent = currentUserHistory.length;
        
        if (currentUserHistory.length > 0) {
            const highest = Math.max(...currentUserHistory.map(h => h.score));
            const totalScore = currentUserHistory.reduce((acc, h) => acc + h.score, 0);
            const avg = totalScore / currentUserHistory.length;
            
            document.getElementById('highest-score').textContent = highest;
            document.getElementById('avg-score').textContent = avg.toFixed(1);
            
            // Certificates Earned (score >= 60%)
            const certs = currentUserHistory.filter(h => (h.score / h.total) >= 0.6).length;
            document.getElementById('certs-earned').textContent = certs;
            
            // Calculate best category
            const catStats = {};
            currentUserHistory.forEach(h => {
                if(!catStats[h.category]) catStats[h.category] = { totalScore: 0, count: 0 };
                catStats[h.category].totalScore += h.score;
                catStats[h.category].count++;
            });
            
            let bestCat = '-';
            let bestAvg = -1;
            for (const cat in catStats) {
                const catAvg = catStats[cat].totalScore / catStats[cat].count;
                if (catAvg > bestAvg) {
                    bestAvg = catAvg;
                    bestCat = cat;
                }
            }
            const bestCatEl = document.getElementById('best-category');
            bestCatEl.textContent = bestCat;
            bestCatEl.title = bestCat;

            const historyContainer = document.getElementById('history-container');
            historyContainer.innerHTML = '';

            // Sort descending by date
            currentUserHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

            currentUserHistory.slice(0, 5).forEach((h, index) => {
                const item = document.createElement('div');
                item.className = 'history-item animate-fade-in';
                item.style.animationDelay = `${index * 0.1}s`;
                
                const date = new Date(h.date).toLocaleDateString();
                item.innerHTML = `
                    <div>
                        <strong>${h.category}</strong> (${h.difficulty})
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${date}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--primary-color);">
                            ${h.score}/${h.total}
                        </div>
                        <button class="btn btn-secondary del-btn" data-date="${h.date}" style="padding: 6px 12px; font-size: 0.9rem; color: var(--danger-color); border-color: var(--danger-color);" aria-label="Delete Record">🗑️</button>
                    </div>
                `;
                historyContainer.appendChild(item);
            });

            // Attach delete listeners
            document.querySelectorAll('.del-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if(confirm('Are you sure you want to delete this record?')) {
                        const dateId = e.target.closest('button').dataset.date;
                        
                        // Remove from History
                        history = history.filter(h => h.date !== dateId);
                        localStorage.setItem('quizHistory', JSON.stringify(history));
                        
                        // Remove from Leaderboard
                        let leaderboard = StorageHelper.getLeaderboard();
                        leaderboard = leaderboard.filter(l => l.date !== dateId);
                        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));

                        renderDashboard();
                    }
                });
            });
        } else {
            document.getElementById('highest-score').textContent = 0;
            document.getElementById('avg-score').textContent = 0;
            document.getElementById('certs-earned').textContent = 0;
            document.getElementById('best-category').textContent = '-';
            document.getElementById('history-container').innerHTML = '<p>No attempts yet. Take a quiz to see your history!</p>';
        }
    }

    renderDashboard();
});
