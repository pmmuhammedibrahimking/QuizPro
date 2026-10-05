// Global standalone Logout helper function
function logoutUser(skipConfirm = false) {
    return AuthManager.logout(skipConfirm);
}

const AuthManager = {
    // Current user getter
    getCurrentUser: function () {
        if (typeof StorageHelper !== 'undefined') {
            return StorageHelper.getUser();
        }
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) { return null; }
    },

    isLoggedIn: function () {
        return !!this.getCurrentUser();
    },

    isAdmin: function () {
        const user = this.getCurrentUser();
        return user && (user.role === 'admin' || user.isAdmin === true);
    },

    ensureSeedUsers: function () {
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        } catch (e) { users = []; }

        const adminIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === 'admin@quizpro.com') || u.role === 'admin' || u.regNumber === 'ADMIN001');
        const demoIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === 'student@quizpro.com') || (u.regNumber && u.regNumber.toUpperCase() === 'BCA202601'));

        let modified = false;
        if (adminIndex === -1) {
            users.unshift({
                id: 'usr_admin',
                name: 'System Admin',
                regNumber: 'ADMIN001',
                department: 'BCA',
                email: 'admin@quizpro.com',
                password: 'admin',
                role: 'admin',
                isAdmin: true,
                createdAt: new Date().toISOString()
            });
            modified = true;
        } else {
            // Guarantee admin password and privileges remain valid
            if (users[adminIndex].password !== 'admin' || users[adminIndex].role !== 'admin' || !users[adminIndex].isAdmin) {
                users[adminIndex].password = 'admin';
                users[adminIndex].role = 'admin';
                users[adminIndex].isAdmin = true;
                modified = true;
            }
        }

        if (demoIndex === -1) {
            users.push({
                id: 'usr_demo',
                name: 'Sample Student',
                regNumber: 'BCA202601',
                department: 'BCA',
                email: 'student@quizpro.com',
                password: 'student',
                role: 'student',
                createdAt: new Date().toISOString()
            });
            modified = true;
        } else {
            // Guarantee demo student credentials and role remain valid
            if (users[demoIndex].password !== 'student' || users[demoIndex].role !== 'student' || users[demoIndex].email !== 'student@quizpro.com') {
                users[demoIndex].password = 'student';
                users[demoIndex].role = 'student';
                users[demoIndex].email = 'student@quizpro.com';
                users[demoIndex].regNumber = users[demoIndex].regNumber || 'BCA202601';
                users[demoIndex].department = users[demoIndex].department || 'BCA';
                modified = true;
            }
        }

        if (modified) {
            localStorage.setItem('quizUsers', JSON.stringify(users));
        }
    },

    ensureAdminSession: function () {
        const seedAdmin = {
            id: 'usr_admin',
            name: 'System Admin',
            regNumber: 'ADMIN001',
            department: 'BCA',
            email: 'admin@quizpro.com',
            password: 'admin',
            role: 'admin',
            isAdmin: true,
            createdAt: new Date().toISOString()
        };
        if (typeof StorageHelper !== 'undefined') {
            StorageHelper.saveUser(seedAdmin);
        } else {
            localStorage.setItem('currentUser', JSON.stringify(seedAdmin));
        }
        this.ensureSeedUsers();
        this.updateUI();
        return true;
    },

    // Student / Admin Registration
    register: async function (userData) {
        this.ensureSeedUsers();

        const cleanName = (userData.name || '').trim();
        const cleanEmail = (userData.email || '').trim().toLowerCase();
        const cleanPass = (userData.password || '').trim();
        const cleanReg = (userData.regNumber || '').trim() || ('BCA' + Math.floor(100000 + Math.random() * 900000));
        const cleanDept = userData.department || 'BCA';
        const role = userData.role || 'student';

        if (!cleanName) {
            return { success: false, error: 'Please enter your full name.' };
        }
        if (!cleanEmail || !cleanEmail.includes('@')) {
            return { success: false, error: 'Please enter a valid email address.' };
        }
        if (!cleanPass) {
            return { success: false, error: 'Please enter a password.' };
        }

        // Local duplicate check
        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        const existing = users.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
        if (existing) {
            return { 
                success: false, 
                error: `An account with email <strong>${cleanEmail}</strong> already exists. <a href="javascript:void(0)" onclick="AuthManager.switchTab('login', {email: '${cleanEmail}'})" style="color: inherit; text-decoration: underline; font-weight: 700;">Click here to Log In &rarr;</a>` 
            };
        }

        // First try backend API if available
        if (typeof API !== 'undefined') {
            try {
                const apiRes = await API.register({
                    name: cleanName,
                    email: cleanEmail,
                    password: cleanPass,
                    regNumber: cleanReg,
                    department: cleanDept,
                    role: role
                });
                if (apiRes && apiRes.success) {
                    API.setToken(apiRes.token);
                    const backendUser = apiRes.user || apiRes.data;
                    const finalUser = {
                        ...backendUser,
                        role: backendUser.role || role,
                        isAdmin: (backendUser.role === 'admin' || role === 'admin')
                    };
                    StorageHelper.saveUser(finalUser);
                    // Sync with local users cache
                    if (!users.some(u => (u.email || '').toLowerCase().trim() === cleanEmail)) {
                        users.push({ ...finalUser, password: cleanPass });
                        localStorage.setItem('quizUsers', JSON.stringify(users));
                    }
                    this.updateUI();
                    return { success: true, user: finalUser };
                } else if (apiRes && !apiRes.success && apiRes.error && !apiRes.error.includes('offline') && !apiRes.error.includes('Network error') && !apiRes.error.includes('Failed to fetch')) {
                    if (apiRes.error.includes('maximum limit') || apiRes.error.includes('already exists')) {
                        return { success: false, error: apiRes.error };
                    }
                }
            } catch (err) {
                console.warn('API register error, falling back to local storage:', err);
            }
        }

        // LocalStorage Fallback & Save
        const newUser = {
            id: 'usr_' + Date.now(),
            name: cleanName,
            regNumber: cleanReg,
            department: cleanDept,
            email: cleanEmail,
            password: cleanPass,
            role: role,
            isAdmin: (role === 'admin'),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('quizUsers', JSON.stringify(users));

        // Auto-login
        StorageHelper.saveUser(newUser);
        this.updateUI();
        return { success: true, user: newUser };
    },

    // Student / Admin Login
    login: async function (email, password, rememberMe = false) {
        this.ensureSeedUsers();

        const cleanInput = (email || '').trim();
        const cleanInputLower = cleanInput.toLowerCase();
        const rawPass = password !== undefined && password !== null ? String(password) : '';
        const cleanPass = rawPass.trim();

        if (!cleanInput || !cleanPass) {
            return { success: false, error: 'Please enter both your email / register number and password.' };
        }

        // 1. Try Backend API first if available
        if (typeof API !== 'undefined') {
            try {
                const apiRes = await API.login({ email: cleanInput, password: cleanPass });
                if (apiRes && apiRes.success) {
                    API.setToken(apiRes.token);
                    const backendUser = apiRes.user || apiRes.data;
                    const finalUser = {
                        ...backendUser,
                        role: backendUser.role || 'student',
                        isAdmin: (backendUser.role === 'admin')
                    };
                    StorageHelper.saveUser(finalUser);
                    if (rememberMe) {
                        localStorage.setItem('rememberedUser', finalUser.email || cleanInput);
                    } else {
                        localStorage.removeItem('rememberedUser');
                    }
                    this.updateUI();
                    return { success: true, user: finalUser };
                }
            } catch (apiErr) {
                console.warn('API login request error:', apiErr);
            }
        }

        // 2. Local Storage Auth Checking
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        } catch (e) { users = []; }

        // Find registered user by Email, Register Number, or 'admin' identifier
        const matchingUser = users.find(u => {
            const uEmail = (u.email || '').toLowerCase().trim();
            const uReg = (u.regNumber || '').toLowerCase().trim();
            return (uEmail === cleanInputLower) || 
                   (uReg === cleanInputLower) ||
                   (cleanInputLower === 'admin' && (u.role === 'admin' || u.isAdmin || uEmail === 'admin@quizpro.com'));
        });

        if (!matchingUser) {
            return { 
                success: false, 
                error: `Account not found. Please check your email/register number or create an account.<br/><a href="javascript:void(0)" onclick="AuthManager.switchTab('signup', {email: '${StorageHelper.escapeHTML(cleanInput)}'})" style="color: inherit; text-decoration: underline; font-weight: 700; margin-top: 5px; display: inline-block;">👉 Click here to create a new Student Account</a>` 
            };
        }

        // Compare entered password with stored password
        const storedPass = matchingUser.password || '';
        const isPasswordCorrect = (storedPass === cleanPass) || (storedPass === rawPass) || (storedPass.trim() === cleanPass);

        if (!isPasswordCorrect) {
            return { 
                success: false, 
                error: `Incorrect password entered. <a href="javascript:void(0)" onclick="AuthManager.switchTab('forgot-password', {email: '${matchingUser.email || cleanInputLower}'})" style="color: inherit; text-decoration: underline; font-weight: 700; margin-left: 4px;">Forgot Password?</a>` 
            };
        }

        // Build authenticated user object
        const finalUser = {
            ...matchingUser,
            role: matchingUser.role || 'student',
            isAdmin: (matchingUser.role === 'admin' || matchingUser.isAdmin === true)
        };

        StorageHelper.saveUser(finalUser);
        if (rememberMe) {
            localStorage.setItem('rememberedUser', finalUser.email || cleanInput);
        } else {
            localStorage.removeItem('rememberedUser');
        }

        this.updateUI();
        return { success: true, user: finalUser };
    },

    fillDemoStudent: function () {
        this.ensureSeedUsers();
        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPass');
        if (emailInput) emailInput.value = 'student@quizpro.com';
        if (passInput) passInput.value = 'student';
        const alertBox = document.getElementById('authAlert');
        if (alertBox) {
            alertBox.style.display = 'none';
            alertBox.innerHTML = '';
        }
    },

    // Guest Mode
    loginAsGuest: function (department = 'BCA') {
        const guestUser = {
            id: 'guest_' + Date.now(),
            name: 'Guest Learner',
            regNumber: 'GST-' + Math.floor(1000 + Math.random() * 9000),
            department: department,
            email: 'guest@quizpro.com',
            role: 'guest',
            isGuest: true,
            createdAt: new Date().toISOString()
        };
        StorageHelper.saveUser(guestUser);
        this.updateUI();
        return guestUser;
    },

    // Forgot Email Trigger - Find email by Reg Number or Name
    forgotEmail: async function (identifier) {
        if (!identifier || !identifier.trim()) {
            return { success: false, error: 'Please enter your Register Number or Full Name.' };
        }

        const query = identifier.trim().toLowerCase();
        this.ensureSeedUsers();

        // Check backend API first if available
        if (typeof API !== 'undefined' && API.forgotEmail) {
            try {
                const apiRes = await API.forgotEmail({ regNumber: query, name: query });
                if (apiRes && apiRes.success) return apiRes;
            } catch (e) {
                // Ignore and use local storage fallback
            }
        }

        // Local Storage fallback & checking
        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        const user = users.find(u => {
            const uReg = (u.regNumber || '').toLowerCase();
            const uName = (u.name || '').toLowerCase();
            const uEmail = (u.email || '').toLowerCase();
            return uReg === query || uName === query || uName.includes(query) || uEmail.startsWith(query);
        });

        if (!user) {
            return { success: false, error: `No student account found matching "<strong>${StorageHelper.escapeHTML(identifier)}</strong>".` };
        }

        return {
            success: true,
            email: user.email,
            name: user.name,
            regNumber: user.regNumber || 'N/A',
            department: user.department || 'BCA',
            message: `Account located for ${user.name}!`
        };
    },

    // Forgot Password Trigger
    forgotPassword: async function (email) {
        if (!email || !email.trim()) {
            return { success: false, error: 'Please enter your registered email address.' };
        }

        const cleanEmail = email.trim().toLowerCase();
        this.ensureSeedUsers();

        if (typeof API !== 'undefined' && API.forgotPassword) {
            try {
                const apiRes = await API.forgotPassword(cleanEmail);
                if (apiRes && apiRes.success) return apiRes;
            } catch (e) {
                // Fallback
            }
        }

        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        const user = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
        if (!user) {
            return { success: false, error: `No account found with email <strong>${StorageHelper.escapeHTML(cleanEmail)}</strong>.` };
        }

        const dummyResetToken = 'rst_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('resetToken_' + dummyResetToken, user.email);
        return {
            success: true,
            message: `Account verified for ${user.name}! Please enter your new password below.`,
            token: dummyResetToken,
            email: user.email,
            name: user.name
        };
    },

    // Reset Password Execution
    resetPassword: async function (tokenOrEmail, newPassword) {
        if (!newPassword) {
            return { success: false, error: 'Please enter a new password.' };
        }

        const targetEmail = (tokenOrEmail || '').trim().toLowerCase();

        if (typeof API !== 'undefined' && API.resetPassword) {
            try {
                const apiRes = await API.resetPassword(targetEmail, newPassword);
                if (apiRes && apiRes.success) {
                    // Success on API
                }
            } catch (e) {
                // Ignore and use local storage fallback
            }
        }

        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        const tokenEmail = localStorage.getItem('resetToken_' + tokenOrEmail);
        const searchEmail = (tokenEmail || targetEmail).toLowerCase();

        const idx = users.findIndex(u => (u.email || '').toLowerCase() === searchEmail);
        if (idx !== -1) {
            users[idx].password = newPassword;
            localStorage.setItem('quizUsers', JSON.stringify(users));
            if (tokenEmail) localStorage.removeItem('resetToken_' + tokenOrEmail);

            // Also update active session if this user is currently logged in
            const curUser = StorageHelper.getUser();
            if (curUser && (curUser.email || '').toLowerCase() === searchEmail) {
                curUser.password = newPassword;
                StorageHelper.saveUser(curUser);
            }

            return { 
                success: true, 
                email: users[idx].email,
                message: `Password updated successfully for <strong>${users[idx].email}</strong>! You can now log in.` 
            };
        }
        return { success: false, error: 'No account found with this email address.' };
    },

    // SVG Icons for Password Visibility
    eyeSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    eyeOffSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,

    // Toggle Password Visibility
    togglePasswordVisibility: function (inputId, btnEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            if (btnEl) btnEl.innerHTML = this.eyeOffSvg;
        } else {
            input.type = 'password';
            if (btnEl) btnEl.innerHTML = this.eyeSvg;
        }
    },

    // Logout with Confirmation Dialog
    logout: function (skipConfirm = false) {
        if (!skipConfirm && !confirm('Are you sure you want to logout?')) {
            return false;
        }

        if (typeof API !== 'undefined') {
            API.logout();
        }

        // Clear ONLY current session keys (preserving quizUsers, quizHistory, quizLeaderboard, quizCertificates, quizSettings)
        localStorage.removeItem('currentUser');
        localStorage.removeItem('quizState');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('quizState');

        if (typeof StorageHelper !== 'undefined') {
            StorageHelper.clearUser();
            StorageHelper.clearQuizState();
        }

        // Close open dropdown menus
        document.querySelectorAll('.profile-dropdown-menu.show').forEach(m => m.classList.remove('show'));

        // Update UI state
        this.updateUI();

        // Redirect appropriately
        const pagePath = window.location.pathname.split('/').pop() || 'index.html';
        if (pagePath.includes('admin') && pagePath !== 'admin-login.html') {
            window.location.href = 'admin-login.html';
        } else {
            window.location.href = 'index.html';
        }
    },

    // Render Navigation Profile Dropdown across all pages
    updateUI: function () {
        const user = this.getCurrentUser();
        const navContainers = document.querySelectorAll('header nav, .nav-auth-container');

        // Detect current page filename for active dropdown item highlighting
        const pagePath = window.location.pathname.split('/').pop() || 'index.html';
        const isDashboard = pagePath === 'dashboard.html';
        const isLeaderboard = pagePath === 'leaderboard.html';
        const isSettings = pagePath === 'settings.html';
        const isAdminPage = pagePath === 'admin-dashboard.html' || pagePath === 'admin-questions.html';

        navContainers.forEach(nav => {
            let authArea = nav.querySelector('.user-auth-widget');
            if (!authArea) {
                authArea = document.createElement('div');
                authArea.className = 'user-auth-widget';
                nav.appendChild(authArea);
            }

            if (user) {
                const avatarChar = user.name ? user.name.charAt(0).toUpperCase() : '👤';
                const roleBadge = user.role === 'admin' ? '<span class="badge badge-admin">Admin</span>' : (user.isGuest ? '<span class="badge badge-guest">Guest</span>' : '<span class="badge badge-student">' + (user.department || 'BCA') + '</span>');
                const displayName = user.name ? user.name.split(' ')[0] : 'User';

                authArea.innerHTML = `
                    <div class="profile-dropdown-container">
                        <button class="profile-pill-btn" id="profileDropdownTrigger" aria-label="User menu">
                            <span class="user-avatar-circle">${avatarChar}</span>
                            <span class="user-name-text">${displayName}</span>
                            <i class="chevron-icon">▾</i>
                        </button>
                        <div class="profile-dropdown-menu" id="profileDropdownMenu">
                            <div class="dropdown-header">
                                <strong>${StorageHelper.escapeHTML(user.name || 'User')}</strong>
                                <small style="display:block; color: var(--text-secondary); word-break: break-all;">${StorageHelper.escapeHTML(user.email || user.regNumber || '')}</small>
                                <div style="margin-top: 0.3rem">${roleBadge}</div>
                            </div>
                            <hr class="dropdown-divider" />
                            <a href="dashboard.html" class="dropdown-item ${isDashboard ? 'active' : ''}">
                                <span>📊 Student Dashboard</span>
                                ${isDashboard ? '<span class="active-dot">•</span>' : ''}
                            </a>
                            <a href="leaderboard.html" class="dropdown-item ${isLeaderboard ? 'active' : ''}">
                                <span>🏆 Leaderboard</span>
                                ${isLeaderboard ? '<span class="active-dot">•</span>' : ''}
                            </a>
                            ${(user.role === 'admin' || user.isAdmin) ? `
                            <a href="admin-dashboard.html" class="dropdown-item ${isAdminPage ? 'active' : ''}">
                                <span>⚙️ Admin Panel</span>
                                ${isAdminPage ? '<span class="active-dot">•</span>' : ''}
                            </a>` : ''}
                            <a href="settings.html" class="dropdown-item ${isSettings ? 'active' : ''}">
                                <span>⚙️ Settings</span>
                                ${isSettings ? '<span class="active-dot">•</span>' : ''}
                            </a>
                            <hr class="dropdown-divider" />
                            <button type="button" class="dropdown-item logout-item" onclick="logoutUser()">
                                <span>🚪 Logout</span>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                authArea.innerHTML = `
                    <div class="auth-btn-group">
                        <button class="btn btn-secondary btn-sm" onclick="AuthManager.showAuthModal('login')">Log In</button>
                        <button class="btn btn-primary btn-sm" onclick="AuthManager.showAuthModal('signup')">Sign Up</button>
                    </div>
                `;
            }
        });

        this.renderMobileDrawer();
        this.bindEvents();
    },

    renderMobileDrawer: function () {
        const drawer = document.getElementById('quizproMobileDrawer');
        if (!drawer) return;

        const user = this.getCurrentUser();
        const pagePath = window.location.pathname.split('/').pop() || 'index.html';
        const isDashboard = pagePath === 'dashboard.html';
        const isLeaderboard = pagePath === 'leaderboard.html';
        const isCertificate = pagePath === 'certificate.html';
        const isSettings = pagePath === 'settings.html';
        const isAdminPage = pagePath === 'admin-dashboard.html' || pagePath === 'admin-questions.html';

        let accountHtml = '';
        if (user) {
            const avatarChar = user.name ? user.name.charAt(0).toUpperCase() : '👤';
            const displayName = StorageHelper.escapeHTML(user.name || 'Student');
            const deptText = StorageHelper.escapeHTML(user.department || 'BCA Examination');
            accountHtml = `
                <div class="mobile-drawer-section-label">ACCOUNT</div>
                <div class="mobile-drawer-user-card" style="margin-bottom: 0.35rem;">
                    <div class="user-avatar-circle" style="width: 36px; height: 36px; font-size: 1.1rem;">${avatarChar}</div>
                    <div style="flex: 1; min-width: 0;">
                        <strong style="font-size: 0.9rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayName}</strong>
                        <small style="color: var(--text-secondary); font-size: 0.725rem;">${deptText}</small>
                    </div>
                </div>
                <a href="${isDashboard ? 'javascript:void(0)' : 'dashboard.html'}" ${isDashboard ? 'onclick="openEditProfileModal()"' : ''} class="mobile-nav-link">
                    <span class="mobile-nav-icon">👤</span> Profile
                </a>
                <button type="button" class="mobile-nav-link" style="color: var(--danger-color);" onclick="logoutUser()">
                    <span class="mobile-nav-icon">🚪</span> Logout
                </button>
            `;
        } else {
            accountHtml = `
                <div class="mobile-drawer-section-label">ACCOUNT</div>
                <button type="button" class="mobile-nav-link" onclick="AuthManager.showAuthModal('login')">
                    <span class="mobile-nav-icon">🔑</span> Log In
                </button>
                <button type="button" class="mobile-nav-link" onclick="AuthManager.showAuthModal('signup')">
                    <span class="mobile-nav-icon">📝</span> Sign Up
                </button>
            `;
        }

        const isAdmin = user && (user.role === 'admin' || user.isAdmin);

        drawer.innerHTML = `
            <div class="quizpro-drawer-header">
                <div class="quizpro-drawer-brand">
                    <a href="index.html" class="quizpro-drawer-title">🎓 QuizPro</a>
                    <span class="quizpro-drawer-subtitle">Online Quiz & Examination System</span>
                </div>
                <button type="button" class="quizpro-drawer-close" id="quizproDrawerClose" aria-label="Close Menu">&times;</button>
            </div>

            <div class="quizpro-drawer-nav">
                <div class="mobile-drawer-section-label" style="margin-top: 0.2rem;">NAVIGATION</div>
                <a href="dashboard.html" class="mobile-nav-link ${isDashboard ? 'active' : ''}">
                    <span class="mobile-nav-icon">🏠</span> Dashboard
                </a>
                <a href="${isDashboard ? 'javascript:void(0)' : 'dashboard.html#departments'}" ${isDashboard ? 'onclick="scrollToSubjects()"' : ''} class="mobile-nav-link">
                    <span class="mobile-nav-icon">🎯</span> Take Quiz
                </a>
                <a href="leaderboard.html" class="mobile-nav-link ${isLeaderboard ? 'active' : ''}">
                    <span class="mobile-nav-icon">🏆</span> Leaderboard
                </a>
                <a href="certificate.html" class="mobile-nav-link ${isCertificate ? 'active' : ''}">
                    <span class="mobile-nav-icon">📜</span> Certificates
                </a>
                <a href="settings.html" class="mobile-nav-link ${isSettings ? 'active' : ''}">
                    <span class="mobile-nav-icon">⚙️</span> Settings
                </a>

                ${isAdmin ? `
                <div class="mobile-drawer-section-label">ADMINISTRATION</div>
                <a href="admin-dashboard.html" class="mobile-nav-link ${isAdminPage ? 'active' : ''}">
                    <span class="mobile-nav-icon">🛠️</span> Admin Panel
                </a>
                ` : ''}

                ${accountHtml}
            </div>

            <div class="mobile-drawer-footer">
                <button type="button" class="mobile-theme-row" onclick="StorageHelper.toggleTheme()">
                    <span style="display: flex; align-items: center; gap: 0.5rem;"><span class="mobile-nav-icon">🌙</span> Appearance</span>
                    <small style="color: var(--text-secondary); font-weight: 500;">Dark / Light</small>
                </button>
            </div>
        `;
    },

    bindEvents: function () {
        // Universal Left-Sliding Mobile Drawer handlers
        const toggleBtn = document.getElementById('quizproMobileToggle');
        const drawer = document.getElementById('quizproMobileDrawer');
        const overlay = document.getElementById('quizproDrawerOverlay');
        const closeBtn = document.getElementById('quizproDrawerClose');

        if (toggleBtn) {
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                if (drawer) drawer.classList.add('active');
                if (overlay) overlay.classList.add('active');
            };
        }

        if (closeBtn) {
            closeBtn.onclick = () => {
                if (drawer) drawer.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            };
        }

        if (overlay) {
            overlay.onclick = () => {
                if (drawer) drawer.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            };
        }

        // Register document-wide listeners only ONCE to prevent listener duplication
        if (!this._listenersBound) {
            this._listenersBound = true;

            // Global click listener to close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.profile-dropdown-container')) {
                    document.querySelectorAll('.profile-dropdown-menu.show').forEach(m => m.classList.remove('show'));
                }
            });

            // Global Escape key listener
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.profile-dropdown-menu.show').forEach(m => m.classList.remove('show'));
                    if (drawer) drawer.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                    this.closeAuthModal();
                }
            });
        }

        // Bind click triggers and menu item click behaviors for all profile dropdown containers in page
        const containers = document.querySelectorAll('.profile-dropdown-container');
        containers.forEach(container => {
            const trigger = container.querySelector('.profile-pill-btn');
            const menu = container.querySelector('.profile-dropdown-menu');

            if (trigger && menu) {
                trigger.onclick = (e) => {
                    e.stopPropagation();
                    // Close any other open menus
                    document.querySelectorAll('.profile-dropdown-menu.show').forEach(m => {
                        if (m !== menu) m.classList.remove('show');
                    });
                    menu.classList.toggle('show');
                };
            }

            // Close dropdown automatically upon clicking any menu item
            const items = container.querySelectorAll('.dropdown-item');
            items.forEach(item => {
                item.onclick = (e) => {
                    if (menu) menu.classList.remove('show');

                    if (item.classList.contains('logout-item') || item.id === 'dropdownLogoutBtn') {
                        e.preventDefault();
                        AuthManager.logout();
                    }
                };
            });
        });
    },

    // Modal Builder for Auth Dialogs
    showAuthModal: function (initialTab = 'login') {
        let modal = document.getElementById('authModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'authModal';
            modal.className = 'modal-backdrop';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-card-split animate-scale-up">
                <!-- Left Brand Side (Desktop) -->
                <div class="auth-brand-side">
                    <div>
                        <div style="font-size: 2.25rem; margin-bottom: 0.5rem;">🎓</div>
                        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; margin-bottom: 0.5rem;">QuizPro Portal</h3>
                        <p style="font-size: 0.9rem; opacity: 0.9;">India's smart online assessment & examination platform for academic mastery.</p>
                    </div>

                    <ul class="auth-perk-list">
                        <li class="auth-perk-item"><span>⚡</span> 500+ Curated Question Bank</li>
                        <li class="auth-perk-item"><span>📊</span> Real-Time Analytics & Accuracy</li>
                        <li class="auth-perk-item"><span>📜</span> Official QR Verified Certificates</li>
                        <li class="auth-perk-item"><span>🏆</span> Inter-Department Leaderboard</li>
                    </ul>

                    <div style="font-size: 0.775rem; opacity: 0.75; border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 0.75rem;">
                        Secure Session Authentication • BCA Exam Portal
                    </div>
                </div>

                <!-- Right Form Side -->
                <div class="auth-form-side">
                    <button type="button" class="modal-close-icon-btn" onclick="AuthManager.closeAuthModal()" title="Close Modal" aria-label="Close">✕</button>

                    <!-- Modern Segmented Tabs -->
                    <div class="auth-segmented-tabs" id="modalAuthTabs">
                        <button type="button" class="auth-tab ${initialTab === 'login' ? 'active' : ''}" id="tabBtnLogin" onclick="AuthManager.switchTab('login')">Student Login</button>
                        <button type="button" class="auth-tab ${initialTab === 'signup' ? 'active' : ''}" id="tabBtnSignup" onclick="AuthManager.switchTab('signup')">Sign Up</button>
                        <button type="button" class="auth-tab ${initialTab === 'admin' ? 'active tab-admin-active' : ''}" id="tabBtnAdmin" onclick="AuthManager.switchTab('admin')">Admin</button>
                    </div>
                    
                    <div id="authAlert" class="alert" style="display:none; margin-bottom: 1rem;"></div>

                    <!-- 1. STUDENT LOGIN FORM -->
                    <form id="loginForm" class="auth-form-view" style="${initialTab === 'login' ? 'display:block' : 'display:none'}">
                        <div class="form-group">
                            <label class="form-label" for="loginEmail">Email or Register Number</label>
                            <input type="text" id="loginEmail" class="form-control" placeholder="student@quizpro.com or ID" required autocomplete="username" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="loginPass">Password</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="loginPass" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
                                <button type="button" class="password-toggle-btn" onclick="AuthManager.togglePasswordVisibility('loginPass', this)" title="Toggle password visibility" aria-label="Toggle password visibility">
                                    ${this.eyeSvg}
                                </button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 0.75rem 0 1.25rem 0; font-size: 0.85rem;">
                            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: var(--text-secondary);">
                                <input type="checkbox" id="rememberMe" /> Remember Me
                            </label>
                            <div style="display: flex; gap: 0.5rem;">
                                <a href="javascript:void(0)" onclick="AuthManager.switchTab('forgot-email')" style="color: var(--primary-color);">Forgot Email?</a>
                                <span style="color: var(--border-color);">|</span>
                                <a href="javascript:void(0)" onclick="AuthManager.switchTab('forgot-password')" style="color: var(--primary-color);">Forgot Password?</a>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Log In to Account</button>

                        <div style="margin-top: 0.85rem; text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
                            Don't have an account? <a href="javascript:void(0)" onclick="AuthManager.switchTab('signup')" style="color: var(--primary-color); font-weight: 700;">Create Account</a>
                        </div>

                        <div class="demo-credential-chip" onclick="AuthManager.fillDemoStudent()">
                            ⚡ <strong>Demo Student:</strong> <code>student@quizpro.com</code> / <code>student</code> <span style="color: var(--primary-color); font-weight: 700; text-decoration: underline;">(Click to Fill)</span>
                        </div>
                    </form>

                    <!-- 2. STUDENT SIGNUP FORM -->
                    <form id="signupForm" class="auth-form-view" style="${initialTab === 'signup' ? 'display:block' : 'display:none'}">
                        <div class="form-group">
                            <label class="form-label" for="signupName">Full Name</label>
                            <input type="text" id="signupName" class="form-control" placeholder="e.g. Alex Morgan" required autocomplete="name" />
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                            <div class="form-group">
                                <label class="form-label" for="signupReg">Register No. <small style="color: var(--text-muted);">(Optional)</small></label>
                                <input type="text" id="signupReg" class="form-control" placeholder="e.g. BCA2026042" />
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="signupDept">Department</label>
                                <select id="signupDept" class="form-control" required>
                                    <option value="BCA">BCA</option>
                                    <option value="BSc">BSc CS/IT</option>
                                    <option value="BCom CA">BCom CA</option>
                                    <option value="BBA">BBA</option>
                                    <option value="BCom">BCom</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="signupEmail">Email Address</label>
                            <input type="email" id="signupEmail" class="form-control" placeholder="alex@example.com" required autocomplete="email" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="signupPass">Create Password</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="signupPass" class="form-control" placeholder="Enter password" required autocomplete="new-password" />
                                <button type="button" class="password-toggle-btn" onclick="AuthManager.togglePasswordVisibility('signupPass', this)" title="Toggle password visibility" aria-label="Toggle password visibility">
                                    ${this.eyeSvg}
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.75rem;">Create Student Account</button>

                        <div style="margin-top: 0.85rem; text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
                            Already have an account? <a href="javascript:void(0)" onclick="AuthManager.switchTab('login')" style="color: var(--primary-color); font-weight: 700;">Log In</a>
                        </div>
                    </form>

                    <!-- 3. ADMIN LOGIN FORM -->
                    <form id="adminForm" class="auth-form-view" style="${initialTab === 'admin' ? 'display:block' : 'display:none'}">
                        <div class="form-group">
                            <label class="form-label" for="adminEmail">Admin Username / Email</label>
                            <input type="text" id="adminEmail" class="form-control" value="admin@quizpro.com" required autocomplete="username" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="adminPass">Admin Password</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="adminPass" class="form-control" value="admin" required autocomplete="current-password" />
                                <button type="button" class="password-toggle-btn" onclick="AuthManager.togglePasswordVisibility('adminPass', this)" title="Toggle password visibility" aria-label="Toggle password visibility">
                                    ${this.eyeSvg}
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-danger btn-block" style="margin-top: 1rem;">🛡️ Access Admin Portal</button>
                        <div style="margin-top: 1rem; text-align: center; font-size: 0.8rem; color: var(--text-secondary);">
                            Demo Admin: <code>admin@quizpro.com</code> | <code>admin</code>
                        </div>
                    </form>

                    <!-- 4. FORGOT EMAIL FORM -->
                    <form id="forgotEmailForm" class="auth-form-view" style="${initialTab === 'forgot-email' ? 'display:block' : 'display:none'}">
                        <h4 style="margin-bottom: 0.35rem;">🔍 Find Registered Email</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Enter your Register Number or Full Name.</p>

                        <div class="form-group">
                            <label class="form-label" for="forgotEmailInput">Register Number or Full Name</label>
                            <input type="text" id="forgotEmailInput" class="form-control" placeholder="e.g. BCA202601 or Alex" required />
                        </div>

                        <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.5rem;" id="findEmailSubmitBtn">Find My Registered Email</button>

                        <div id="forgotEmailResult" class="recovery-result-box" style="display: none; background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-md); margin-top: 0.75rem; font-size: 0.85rem;">
                            <div>Student: <strong id="resEmailName">-</strong></div>
                            <div>Reg No: <strong id="resEmailReg">-</strong></div>
                            <div>Department: <strong id="resEmailDept">-</strong></div>
                            <div style="margin-top: 0.35rem; color: var(--primary-color);">Email: <strong id="resEmailValue">-</strong></div>
                            <button type="button" class="btn btn-primary btn-sm btn-block" style="margin-top: 0.5rem;" id="useFoundEmailBtn">Log In with This Email</button>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.85rem;">
                            <a href="javascript:void(0)" onclick="AuthManager.switchTab('login')">← Back to Login</a>
                            <a href="javascript:void(0)" onclick="AuthManager.switchTab('forgot-password')">Forgot Password? →</a>
                        </div>
                    </form>

                    <!-- 5. FORGOT PASSWORD FORM -->
                    <form id="forgotPasswordForm" class="auth-form-view" style="${initialTab === 'forgot-password' || initialTab === 'forgot' ? 'display:block' : 'display:none'}">
                        <h4 style="margin-bottom: 0.35rem;">🔐 Reset Password</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Enter your registered email and new password.</p>

                        <div class="form-group">
                            <label class="form-label" for="forgotPassEmail">Registered Email</label>
                            <input type="email" id="forgotPassEmail" class="form-control" placeholder="student@quizpro.com" required autocomplete="email" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="forgotPassNew">New Password</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="forgotPassNew" class="form-control" placeholder="Enter new password" required autocomplete="new-password" />
                                <button type="button" class="password-toggle-btn" onclick="AuthManager.togglePasswordVisibility('forgotPassNew', this)" title="Toggle password visibility" aria-label="Toggle password visibility">
                                    ${this.eyeSvg}
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="forgotPassConfirm">Confirm New Password</label>
                            <div class="password-input-wrapper">
                                <input type="password" id="forgotPassConfirm" class="form-control" placeholder="Re-type new password" required autocomplete="new-password" />
                                <button type="button" class="password-toggle-btn" onclick="AuthManager.togglePasswordVisibility('forgotPassConfirm', this)" title="Toggle password visibility" aria-label="Toggle password visibility">
                                    ${this.eyeSvg}
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem;" id="resetPassSubmitBtn">🔄 Reset & Update Password</button>

                        <div id="forgotPassResult" style="display: none; margin-top: 1rem;">
                            <button type="button" class="btn btn-primary btn-block" id="proceedToLoginBtn">👉 Proceed to Login</button>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.85rem;">
                            <a href="javascript:void(0)" onclick="AuthManager.switchTab('login')">← Back to Login</a>
                            <a href="javascript:void(0)" onclick="AuthManager.switchTab('forgot-email')">Forgot Email?</a>
                        </div>
                    </form>
                </div>
            </div>
        `;

        modal.classList.add('active');
        this.attachModalFormListeners();
    },

    switchTab: function (tab, prefillData = null) {
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(t => {
            t.classList.remove('active');
            t.classList.remove('tab-admin-active');
        });

        const views = document.querySelectorAll('.auth-form-view');
        views.forEach(v => v.style.display = 'none');

        const alertBox = document.getElementById('authAlert');
        if (alertBox) {
            alertBox.style.display = 'none';
            alertBox.innerHTML = '';
        }

        const emailResult = document.getElementById('forgotEmailResult');
        if (emailResult) emailResult.style.display = 'none';

        const passResult = document.getElementById('forgotPassResult');
        if (passResult) passResult.style.display = 'none';

        if (tab === 'login') {
            const loginBtn = document.getElementById('tabBtnLogin');
            if (loginBtn) loginBtn.classList.add('active');
            const form = document.getElementById('loginForm');
            if (form) form.style.display = 'block';

            if (prefillData && prefillData.email) {
                const emailInput = document.getElementById('loginEmail');
                if (emailInput) {
                    emailInput.value = prefillData.email;
                    const passInput = document.getElementById('loginPass');
                    if (passInput) passInput.focus();
                }
            }
        } else if (tab === 'signup') {
            const signupBtn = document.getElementById('tabBtnSignup');
            if (signupBtn) signupBtn.classList.add('active');
            const form = document.getElementById('signupForm');
            if (form) form.style.display = 'block';

            if (prefillData && prefillData.email) {
                const emailInput = document.getElementById('signupEmail');
                if (emailInput) {
                    emailInput.value = prefillData.email;
                    const nameInput = document.getElementById('signupName');
                    if (nameInput) nameInput.focus();
                }
            }
        } else if (tab === 'admin') {
            const adminBtn = document.getElementById('tabBtnAdmin');
            if (adminBtn) {
                adminBtn.classList.add('active');
                adminBtn.classList.add('tab-admin-active');
            }
            const form = document.getElementById('adminForm');
            if (form) form.style.display = 'block';
        } else if (tab === 'forgot-email') {
            const form = document.getElementById('forgotEmailForm');
            if (form) {
                form.style.display = 'block';
                const input = document.getElementById('forgotEmailInput');
                if (input) {
                    input.value = '';
                    input.focus();
                }
            }
        } else if (tab === 'forgot-password' || tab === 'forgot') {
            const form = document.getElementById('forgotPasswordForm');
            if (form) {
                form.style.display = 'block';
                const emailInput = document.getElementById('forgotPassEmail');
                if (emailInput) {
                    if (prefillData && prefillData.email) {
                        emailInput.value = prefillData.email;
                        const passInput = document.getElementById('forgotPassNew');
                        if (passInput) passInput.focus();
                    } else {
                        emailInput.focus();
                    }
                }
            }
        }
    },

    closeAuthModal: function () {
        const modal = document.getElementById('authModal');
        if (modal) modal.classList.remove('active');
    },

    continueGuest: function () {
        this.loginAsGuest('BCA');
        this.closeAuthModal();
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    },

    attachModalFormListeners: function () {
        // 1. Login Form Submit
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            let isLoggingIn = false;
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                if (isLoggingIn) return;

                const emailInput = document.getElementById('loginEmail');
                const passInput = document.getElementById('loginPass');
                const remInput = document.getElementById('rememberMe');
                const submitBtn = loginForm.querySelector('button[type="submit"]');

                const email = emailInput ? emailInput.value.trim() : '';
                const pass = passInput ? passInput.value : '';
                const rem = remInput ? remInput.checked : false;

                if (!email || !pass) {
                    this.showAlert('Please enter both your email / register number and password.', 'danger');
                    return;
                }

                isLoggingIn = true;
                const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Log In to Account';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>⏳ Logging in...</span>';
                }

                try {
                    const res = await this.login(email, pass, rem);
                    if (res && res.success) {
                        this.showAlert('✅ Login successful! Redirecting...', 'success');
                        setTimeout(() => {
                            this.closeAuthModal();
                            if (res.user && (res.user.role === 'admin' || res.user.isAdmin === true)) {
                                window.location.href = 'admin-dashboard.html';
                            } else {
                                window.location.href = 'dashboard.html';
                            }
                        }, 350);
                    } else {
                        const errMsg = (res && res.error) ? res.error : 'Incorrect password entered.';
                        this.showAlert(errMsg, 'danger');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalBtnText;
                        }
                        isLoggingIn = false;
                    }
                } catch (err) {
                    console.error('Login submit error:', err);
                    this.showAlert('An unexpected error occurred during login. Please try again.', 'danger');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    isLoggingIn = false;
                }
            };
        }

        // 2. Signup Form Submit
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            let isRegistering = false;
            signupForm.onsubmit = async (e) => {
                e.preventDefault();
                if (isRegistering) return;

                const nameInput = document.getElementById('signupName');
                const regInput = document.getElementById('signupReg');
                const deptInput = document.getElementById('signupDept');
                const emailInput = document.getElementById('signupEmail');
                const passInput = document.getElementById('signupPass');
                const submitBtn = signupForm.querySelector('button[type="submit"]');

                const data = {
                    name: nameInput ? nameInput.value.trim() : '',
                    regNumber: regInput ? regInput.value.trim() : '',
                    department: deptInput ? deptInput.value : 'BCA',
                    email: emailInput ? emailInput.value.trim() : '',
                    password: passInput ? passInput.value : '',
                    role: 'student'
                };

                if (!data.name || !data.email || !data.password) {
                    this.showAlert('Please fill in all required fields.', 'danger');
                    return;
                }

                isRegistering = true;
                const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Create Student Account';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>⏳ Creating Account...</span>';
                }

                try {
                    const res = await this.register(data);
                    if (res && res.success) {
                        this.showAlert('✅ Account created successfully! Redirecting...', 'success');
                        setTimeout(() => {
                            this.closeAuthModal();
                            window.location.href = 'dashboard.html';
                        }, 350);
                    } else {
                        this.showAlert(res.error || 'Failed to create account.', 'danger');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalBtnText;
                        }
                        isRegistering = false;
                    }
                } catch (err) {
                    console.error('Registration submit error:', err);
                    this.showAlert('An error occurred during registration. Please try again.', 'danger');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    isRegistering = false;
                }
            };
        }

        // 3. Admin Form Submit
        const adminForm = document.getElementById('adminForm');
        if (adminForm) {
            let isAdminLoggingIn = false;
            adminForm.onsubmit = async (e) => {
                e.preventDefault();
                if (isAdminLoggingIn) return;

                const emailInput = document.getElementById('adminEmail');
                const passInput = document.getElementById('adminPass');
                const submitBtn = adminForm.querySelector('button[type="submit"]');
                const email = emailInput && emailInput.value ? emailInput.value.trim() : 'admin@quizpro.com';
                const pass = passInput && passInput.value ? passInput.value.trim() : '';

                isAdminLoggingIn = true;
                const originalBtnText = submitBtn ? submitBtn.innerHTML : '🛡️ Access Admin Portal';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>⏳ Authenticating...</span>';
                }

                try {
                    const res = await this.login(email, pass);
                    if (res.success && (res.user.role === 'admin' || res.user.isAdmin === true)) {
                        this.showAlert('✅ Admin authenticated! Redirecting...', 'success');
                        setTimeout(() => {
                            this.closeAuthModal();
                            window.location.href = 'admin-dashboard.html';
                        }, 350);
                    } else if (res.success) {
                        this.showAlert('This account does not have administrator privileges.', 'danger');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalBtnText;
                        }
                        isAdminLoggingIn = false;
                    } else {
                        this.showAlert(res.error || 'Invalid administrator username or password.', 'danger');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = originalBtnText;
                        }
                        isAdminLoggingIn = false;
                    }
                } catch (err) {
                    console.error('Admin login error:', err);
                    this.showAlert('An error occurred during authentication.', 'danger');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    isAdminLoggingIn = false;
                }
            };
        }

        // 4. Forgot Email Form Submit
        const forgotEmailForm = document.getElementById('forgotEmailForm');
        if (forgotEmailForm) {
            forgotEmailForm.onsubmit = async (e) => {
                e.preventDefault();
                const identifier = document.getElementById('forgotEmailInput').value.trim();
                const res = await this.forgotEmail(identifier);
                
                const resultCard = document.getElementById('forgotEmailResult');
                if (res.success) {
                    this.showAlert(res.message, 'success');
                    if (resultCard) {
                        document.getElementById('resEmailName').innerText = res.name || '-';
                        document.getElementById('resEmailReg').innerText = res.regNumber || '-';
                        document.getElementById('resEmailDept').innerText = res.department || '-';
                        document.getElementById('resEmailValue').innerText = res.email || '-';
                        resultCard.style.display = 'block';

                        // Hook up 1-click button to use this email for login
                        const useEmailBtn = document.getElementById('useFoundEmailBtn');
                        if (useEmailBtn) {
                            useEmailBtn.onclick = () => {
                                this.switchTab('login', { email: res.email });
                            };
                        }
                    }
                } else {
                    if (resultCard) resultCard.style.display = 'none';
                    this.showAlert(res.error || 'No matching account found.', 'danger');
                }
            };
        }

        // 5. Forgot Password Form Submit
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('forgotPassEmail').value.trim();
                const newPass = document.getElementById('forgotPassNew').value;
                const confirmPass = document.getElementById('forgotPassConfirm').value;

                if (newPass !== confirmPass) {
                    this.showAlert('Passwords do not match. Please re-enter identical passwords.', 'danger');
                    return;
                }

                if (newPass.length < 6) {
                    this.showAlert('Password must be at least 6 characters long.', 'danger');
                    return;
                }

                // Verify and reset
                const res = await this.resetPassword(email, newPass);
                const passResult = document.getElementById('forgotPassResult');
                if (res.success) {
                    this.showAlert(res.message, 'success');
                    if (passResult) {
                        passResult.style.display = 'block';
                        const proceedBtn = document.getElementById('proceedToLoginBtn');
                        if (proceedBtn) {
                            proceedBtn.onclick = () => {
                                this.switchTab('login', { email: email });
                            };
                        }
                    }
                } else {
                    if (passResult) passResult.style.display = 'none';
                    this.showAlert(res.error || 'Failed to reset password. Please check your email address.', 'danger');
                }
            };
        }
    },

    showAlert: function (msg, type = 'info') {
        const box = document.getElementById('authAlert');
        if (box) {
            box.className = `alert alert-${type}`;
            box.innerHTML = msg;
            box.style.display = 'block';
        }
    }
};

// Initialize navigation header auth state & mobile navigation drawer on load
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.updateUI();

    function openDrawer() {
        const drawerEl = document.getElementById('quizproMobileDrawer');
        const overlayEl = document.getElementById('quizproDrawerOverlay');
        if (drawerEl) {
            drawerEl.classList.add('open', 'active', 'show');
        }
        if (overlayEl) {
            overlayEl.classList.add('open', 'active', 'show');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        const drawerEl = document.getElementById('quizproMobileDrawer');
        const overlayEl = document.getElementById('quizproDrawerOverlay');
        if (drawerEl) {
            drawerEl.classList.remove('open', 'active', 'show');
        }
        if (overlayEl) {
            overlayEl.classList.remove('open', 'active', 'show');
        }
        document.body.style.overflow = '';
    }

    // Export globally for inline onclick or manual invocations
    window.openQuizProDrawer = openDrawer;
    window.closeQuizProDrawer = closeDrawer;

    // Use document event delegation so hamburger toggle works reliably across all pages
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#quizproMobileToggle, .quizpro-mobile-toggle');
        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            openDrawer();
            return;
        }

        const closeBtn = e.target.closest('#quizproDrawerClose, .quizpro-drawer-close');
        if (closeBtn) {
            e.preventDefault();
            closeDrawer();
            return;
        }

        const overlayEl = e.target.closest('#quizproDrawerOverlay, .quizpro-drawer-overlay');
        if (overlayEl) {
            closeDrawer();
            return;
        }

        if (e.target.closest('#quizproMobileDrawer a, .quizpro-mobile-drawer a')) {
            closeDrawer();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
        }
    });
});

// AdminAuth Helper Alias for backward compatibility
const AdminAuth = {
    isLoggedIn: function () {
        return AuthManager.isAdmin();
    },
    login: async function (username, password) {
        const res = await AuthManager.login(username, password);
        return res.success && (res.user.role === 'admin' || res.user.isAdmin);
    },
    logout: function () {
        AuthManager.logout(true);
    }
};

