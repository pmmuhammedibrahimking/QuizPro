const StorageHelper = {
    // Save current user info
    saveUser: function(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    // Get current user info
    getUser: function() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },
    // Save quiz settings (theme, sound, etc)
    saveSettings: function(settings) {
        localStorage.setItem('quizSettings', JSON.stringify(settings));
    },
    // Get quiz settings
    getSettings: function() {
        const defaultSettings = { theme: 'light', sound: true, timer: true };
        const settings = JSON.parse(localStorage.getItem('quizSettings'));
        return settings ? { ...defaultSettings, ...settings } : defaultSettings;
    },
    // Apply Theme globally
    applyTheme: function() {
        const settings = this.getSettings();
        if (settings.theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    },
    // Toggle Theme
    toggleTheme: function() {
        const settings = this.getSettings();
        settings.theme = settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings(settings);
        this.applyTheme();
        return settings.theme;
    },
    // Save current quiz configuration
    saveQuizConfig: function(config) {
        localStorage.setItem('quizConfig', JSON.stringify(config));
    },
    // Get current quiz configuration
    getQuizConfig: function() {
        return JSON.parse(localStorage.getItem('quizConfig'));
    },
    // Save in-progress quiz state
    saveQuizState: function(state) {
        localStorage.setItem('quizState', JSON.stringify(state));
    },
    // Get in-progress quiz state
    getQuizState: function() {
        return JSON.parse(localStorage.getItem('quizState'));
    },
    // Save attempt to history and leaderboard
    saveAttempt: function(attemptResult) {
        let history = JSON.parse(localStorage.getItem('quizHistory')) || [];
        history.push(attemptResult);
        localStorage.setItem('quizHistory', JSON.stringify(history));

        let leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
        leaderboard.push({
            name: attemptResult.user.name,
            score: attemptResult.score,
            total: attemptResult.total,
            category: attemptResult.category,
            date: attemptResult.date
        });
        
        // Sort descending by score, then ascending by time taken
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
    },
    getHistory: function() {
        return JSON.parse(localStorage.getItem('quizHistory')) || [];
    },
    getLeaderboard: function() {
        return JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
    },
    // Get Question Bank
    getQuestions: function() {
        const stored = localStorage.getItem('quizQuestions');
        if (stored) {
            return JSON.parse(stored);
        }
        // Fallback to default questions if empty
        return typeof defaultQuizQuestions !== 'undefined' ? defaultQuizQuestions : {};
    },
    // Save Question Bank
    saveQuestions: function(questions) {
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
    }
};

// Auto-apply theme on load
document.addEventListener('DOMContentLoaded', () => {
    StorageHelper.applyTheme();
});

// Robust Global Loader Hiding
function hideGlobalLoader() {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('loader-hidden');
    }, 150);
}

if (document.readyState === 'complete') {
    hideGlobalLoader();
} else {
    window.addEventListener('load', hideGlobalLoader);
}

// Handle browser back button (bfcache)
window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
        hideGlobalLoader();
    }
});
