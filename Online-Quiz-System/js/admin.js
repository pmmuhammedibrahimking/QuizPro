const AdminAuth = {
    // Hardcoded credentials for project demonstration
    CREDENTIALS: {
        username: 'admin',
        password: 'password123'
    },

    login: function(username, password) {
        if (username === this.CREDENTIALS.username && password === this.CREDENTIALS.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            return true;
        }
        return false;
    },

    logout: function() {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    },

    isLoggedIn: function() {
        return sessionStorage.getItem('adminLoggedIn') === 'true';
    },

    protectRoute: function() {
        if (!this.isLoggedIn()) {
            window.location.href = 'admin-login.html';
        }
    }
};

// Global hook for logout button if it exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AdminAuth.logout();
        });
    }
});
