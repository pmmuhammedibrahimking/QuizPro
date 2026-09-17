/**
 * Enhanced Storage Helper for QuizPro
 * Manages User state, Settings, Departments, Questions, Quiz History,
 * Leaderboard, Certificates, Badges, and Accessibility Preferences.
 */

const StorageHelper = {
    // Save current user info
    saveUser: function (user) {
        if (!user) {
            localStorage.removeItem('currentUser');
            return;
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Get current user info (returns null if unauthenticated)
    getUser: function () {
        try {
            const raw = localStorage.getItem('currentUser');
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) { 
            return null; 
        }
    },

    // Clear current logged-in user session
    clearUser: function () {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
    },

    // Save quiz settings (theme, sound, timer, font, highContrast)
    saveSettings: function (settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem('quizSettings', JSON.stringify(updated));
        this.applySettings();
    },

    // Get quiz settings
    getSettings: function () {
        const defaultSettings = {
            theme: 'light',
            sound: true,
            timer: true,
            fontSize: 'medium',
            highContrast: false
        };
        try {
            const settings = JSON.parse(localStorage.getItem('quizSettings'));
            return settings ? { ...defaultSettings, ...settings } : defaultSettings;
        } catch (e) { return defaultSettings; }
    },

    // Apply Theme and Font preferences globally
    applySettings: function () {
        const settings = this.getSettings();

        // Theme
        if (settings.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
        }

        // Font Size
        document.documentElement.setAttribute('data-font-size', settings.fontSize || 'medium');

        // High Contrast
        if (settings.highContrast) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        } else {
            document.documentElement.removeAttribute('data-high-contrast');
        }
    },

    applyTheme: function () {
        this.applySettings();
    },

    // Toggle Theme
    toggleTheme: function () {
        const settings = this.getSettings();
        settings.theme = settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings(settings);
        return settings.theme;
    },

    // Quiz Configuration State
    saveQuizConfig: function (config) {
        localStorage.setItem('quizConfig', JSON.stringify(config));
    },

    getQuizConfig: function () {
        try {
            return JSON.parse(localStorage.getItem('quizConfig')) || { category: 'Python', department: 'BCA', difficulty: 'all' };
        } catch (e) {
            return { category: 'Python', department: 'BCA', difficulty: 'all' };
        }
    },

    // Save & Get in-progress quiz state
    saveQuizState: function (state) {
        localStorage.setItem('quizState', JSON.stringify(state));
    },

    getQuizState: function () {
        try {
            return JSON.parse(localStorage.getItem('quizState'));
        } catch (e) { return null; }
    },

    clearQuizState: function () {
        localStorage.removeItem('quizState');
    },

    // Save attempt to history, leaderboard, certificates, and update badges
    saveAttempt: function (attemptResult) {
        let history = this.getHistory();
        history.unshift(attemptResult);
        localStorage.setItem('quizHistory', JSON.stringify(history));

        // Leaderboard insertion
        let leaderboard = this.getLeaderboard();
        leaderboard.push({
            id: 'ld_' + Date.now(),
            name: attemptResult.user.name,
            regNumber: attemptResult.user.regNumber || 'N/A',
            department: attemptResult.user.department || attemptResult.department || 'BCA',
            score: attemptResult.score,
            total: attemptResult.total,
            percentage: attemptResult.percentage,
            category: attemptResult.category,
            timeTaken: attemptResult.timeTaken || 0,
            date: attemptResult.date || new Date().toISOString()
        });

        // Sort descending by score, then percentage, then ascending by time taken
        leaderboard.sort((a, b) => {
            if (b.percentage !== a.percentage) return b.percentage - a.percentage;
            return (a.timeTaken || 0) - (b.timeTaken || 0);
        });

        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));

        // Save Certificate if passed (percentage >= 50%)
        if (attemptResult.percentage >= 50) {
            this.issueCertificate(attemptResult);
        }

        // Check & unlock achievement badges
        this.updateBadges(history);
    },

    getHistory: function () {
        try {
            return JSON.parse(localStorage.getItem('quizHistory')) || [];
        } catch (e) { return []; }
    },

    getLeaderboard: function () {
        try {
            return JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
        } catch (e) { return []; }
    },

    // Issue Certificate
    issueCertificate: function (attempt) {
        let certificates = this.getCertificates();
        const certId = 'CERT-' + Math.floor(100000 + Math.random() * 900000);
        const cert = {
            id: certId,
            studentName: attempt.user.name,
            regNumber: attempt.user.regNumber || 'N/A',
            department: attempt.user.department || attempt.department || 'BCA',
            subject: attempt.category,
            percentage: attempt.percentage,
            grade: attempt.grade || 'A',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            verificationUrl: window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + 'certificate.html?certId=' + certId
        };
        certificates.unshift(cert);
        localStorage.setItem('quizCertificates', JSON.stringify(certificates));
        return cert;
    },

    getCertificates: function () {
        try {
            return JSON.parse(localStorage.getItem('quizCertificates')) || [];
        } catch (e) { return []; }
    },

    getCertificateById: function (id) {
        const certs = this.getCertificates();
        return certs.find(c => c.id === id);
    },

    // Achievement Badges System
    updateBadges: function (history) {
        const badges = [];
        if (history.length >= 1) badges.push({ title: 'First Quiz', icon: '🚀', desc: 'Completed your first quiz attempt' });
        if (history.length >= 5) badges.push({ title: 'Quiz Enthusiast', icon: '🔥', desc: 'Completed 5+ quizzes' });
        if (history.length >= 10) badges.push({ title: 'Quiz Master', icon: '👑', desc: 'Completed 10+ quizzes' });

        const perfects = history.filter(h => h.percentage === 100);
        if (perfects.length >= 1) badges.push({ title: 'Perfectionist', icon: '🎯', desc: 'Scored 100% in a quiz' });

        const speedy = history.filter(h => h.percentage >= 80 && (h.timeTaken < 120));
        if (speedy.length >= 1) badges.push({ title: 'Speed Demon', icon: '⚡', desc: 'Passed quiz in under 2 minutes' });

        localStorage.setItem('quizBadges', JSON.stringify(badges));
    },

    getBadges: function () {
        try {
            return JSON.parse(localStorage.getItem('quizBadges')) || [];
        } catch (e) { return []; }
    },

    // Question Bank Helpers
    getQuestions: function () {
        const stored = localStorage.getItem('quizQuestions');
        const defaults = typeof defaultQuizQuestions !== 'undefined' ? defaultQuizQuestions : {};
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return { ...defaults, ...parsed };
            } catch (e) {
                console.error("Error loading stored questions:", e);
            }
        }
        return defaults;
    },

    saveQuestions: function (questions) {
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
    },

    // HTML escaping helper
    escapeHTML: function (str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // Privacy Policy Acknowledgement Storage
    isPrivacyAcknowledged: function () {
        return localStorage.getItem('privacyAcknowledged') === 'true';
    },

    acknowledgePrivacy: function () {
        localStorage.setItem('privacyAcknowledged', 'true');
    },

    // Global Loader Helpers
    hideLoader: function () {
        hideGlobalLoader();
    },

    showLoader: function () {
        showGlobalLoader();
    }
};

// Global Modal Helpers
function openModal(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (modal) {
        modal.classList.add('active', 'show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (modal) {
        modal.classList.remove('active', 'show');
        const remaining = document.querySelectorAll('.modal-backdrop.active, .modal-backdrop.show, .modal-overlay.active, .modal-overlay.show');
        if (remaining.length === 0) {
            document.body.style.overflow = '';
        }
    }
}

// Global Modal Keyboard ESC & Backdrop Click Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-backdrop.active, .modal-backdrop.show, .modal-overlay.active, .modal-overlay.show');
        activeModals.forEach(modal => {
            if (modal.id === 'privacyModal') {
                if (typeof acknowledgePrivacyPolicy === 'function') {
                    acknowledgePrivacyPolicy();
                } else {
                    StorageHelper.acknowledgePrivacy();
                    closeModal(modal);
                }
            } else {
                closeModal(modal);
            }
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-overlay')) {
        const modal = e.target;
        if (modal.id === 'privacyModal') {
            if (typeof acknowledgePrivacyPolicy === 'function') {
                acknowledgePrivacyPolicy();
            } else {
                StorageHelper.acknowledgePrivacy();
                closeModal(modal);
            }
        } else {
            closeModal(modal);
        }
    }
});

// Global Loader Hiding
function hideGlobalLoader() {
    const loader = document.getElementById('loader') || document.querySelector('.global-loader');
    if (loader) {
        loader.classList.add('hidden');
        loader.classList.add('loader-hidden');
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
            if (loader) loader.style.display = 'none';
        }, 300);
    }
}

function showGlobalLoader() {
    const loader = document.getElementById('loader') || document.querySelector('.global-loader');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.visibility = 'visible';
        loader.style.opacity = '1';
        loader.style.pointerEvents = 'auto';
        loader.classList.remove('hidden', 'loader-hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    StorageHelper.applySettings();
    hideGlobalLoader();
    if (document.readyState === 'complete') hideGlobalLoader();
    else window.addEventListener('load', hideGlobalLoader);

    // Stop propagation on modal cards so clicks inside never trigger background dismiss
    document.querySelectorAll('.modal-card').forEach(card => {
        card.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
});

// Fallback safety timer to ensure loader is never stuck on screen
setTimeout(hideGlobalLoader, 800);

window.addEventListener('pageshow', (e) => {
    if (e.persisted) hideGlobalLoader();
});

