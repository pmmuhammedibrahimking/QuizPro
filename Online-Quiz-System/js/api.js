const API_BASE = '/api';

const API = {
    getToken: function() {
        return localStorage.getItem('token');
    },
    setToken: function(token) {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    },
    headers: function() {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },
    request: async function(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method,
                headers: this.headers()
            };
            if (data) {
                config.body = JSON.stringify(data);
            }
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const result = await response.json();
            return result;
        } catch (error) {
            console.warn(`API Error on ${endpoint}:`, error);
            return { success: false, error: 'Network error or backend offline' };
        }
    },
    // Auth endpoints
    register: function(userData) {
        return this.request('/auth/register', 'POST', userData);
    },
    login: function(credentials) {
        return this.request('/auth/login', 'POST', credentials);
    },
    logout: function() {
        this.setToken(null);
        return this.request('/auth/logout', 'POST');
    },
    getProfile: function() {
        return this.request('/auth/me', 'GET');
    },
    updateProfile: function(data) {
        return this.request('/auth/update-profile', 'PUT', data);
    },
    changePassword: function(data) {
        return this.request('/auth/change-password', 'PUT', data);
    },
    forgotPassword: function(email) {
        return this.request('/auth/forgot-password', 'POST', { email });
    },
    resetPassword: function(resetToken, newPassword) {
        return this.request('/auth/reset-password', 'POST', { resetToken, newPassword });
    },
    // Quiz endpoints
    getCategories: function() {
        return this.request('/quizzes/categories', 'GET');
    },
    getQuestions: function(category, difficulty) {
        return this.request(`/quizzes/questions?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`, 'GET');
    },
    submitQuiz: function(quizData) {
        return this.request('/quizzes/submit', 'POST', quizData);
    },
    getHistory: function() {
        return this.request('/quizzes/history', 'GET');
    },
    getLeaderboard: function() {
        return this.request('/quizzes/leaderboard', 'GET');
    },
    // Admin endpoints
    getAdminDashboard: function() {
        return this.request('/admin/dashboard', 'GET');
    },
    getAdminUsers: function() {
        return this.request('/admin/users', 'GET');
    },
    deleteUser: function(id) {
        return this.request(`/admin/users/${id}`, 'DELETE');
    },
    addQuestion: function(qData) {
        return this.request('/admin/questions', 'POST', qData);
    },
    updateQuestion: function(id, qData) {
        return this.request(`/admin/questions/${id}`, 'PUT', qData);
    },
    deleteQuestion: function(id) {
        return this.request(`/admin/questions/${id}`, 'DELETE');
    }
};
