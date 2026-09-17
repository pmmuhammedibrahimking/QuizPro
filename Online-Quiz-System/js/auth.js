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

    ensureAdminSession: function () {
        if (!this.isAdmin()) {
            const seedAdmin = {
                id: 'usr_admin',
                name: 'System Admin',
                regNumber: 'ADMIN001',
                department: 'BCA',
                email: 'admin@quizpro.com',
                password: 'admin',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            if (typeof StorageHelper !== 'undefined') {
                StorageHelper.saveUser(seedAdmin);
            } else {
                localStorage.setItem('currentUser', JSON.stringify(seedAdmin));
            }
            this.updateUI();
        }
        return true;
    },

    // Student / Admin Registration
    register: async function (userData) {
        // First try backend API if available
        if (typeof API !== 'undefined') {
            const apiRes = await API.register(userData);
            if (apiRes && apiRes.success) {
                API.setToken(apiRes.token);
                StorageHelper.saveUser(apiRes.user || apiRes.data);
                this.updateUI();
                return { success: true, user: apiRes.user || apiRes.data };
            }
        }

        // LocalStorage Fallback & Synchronize
        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existing) {
            return { success: false, error: 'User with this email already exists' };
        }

        const newUser = {
            id: 'usr_' + Date.now(),
            name: userData.name,
            regNumber: userData.regNumber || 'REG' + Math.floor(100000 + Math.random() * 900000),
            department: userData.department || 'BCA',
            email: userData.email,
            password: userData.password,
            role: userData.role || 'student',
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
        if (typeof API !== 'undefined') {
            const apiRes = await API.login({ email, password });
            if (apiRes && apiRes.success) {
                API.setToken(apiRes.token);
                StorageHelper.saveUser(apiRes.user || apiRes.data);
                this.updateUI();
                return { success: true, user: apiRes.user || apiRes.data };
            }
        }

        // Local Storage checking
        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];

        // Default seed accounts if none exist
        if (users.length === 0) {
            users = [
                {
                    id: 'usr_admin',
                    name: 'System Admin',
                    regNumber: 'ADMIN001',
                    department: 'BCA',
                    email: 'admin@quizpro.com',
                    password: 'admin',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'usr_demo',
                    name: 'Sample Student',
                    regNumber: 'BCA202601',
                    department: 'BCA',
                    email: 'student@quizpro.com',
                    password: 'student',
                    role: 'student',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('quizUsers', JSON.stringify(users));
        }

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        StorageHelper.saveUser(user);
        if (rememberMe) {
            localStorage.setItem('rememberedUser', email);
        } else {
            localStorage.removeItem('rememberedUser');
        }

        this.updateUI();
        return { success: true, user };
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

    // Forgot Password Trigger
    forgotPassword: async function (email) {
        if (typeof API !== 'undefined') {
            const apiRes = await API.forgotPassword(email);
            if (apiRes && apiRes.success) return apiRes;
        }

        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return { success: false, error: 'No account found with this email address' };
        }

        const dummyResetToken = 'rst_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('resetToken_' + dummyResetToken, email);
        return {
            success: true,
            message: 'Password reset link sent! Demonstration Reset Token: ' + dummyResetToken,
            token: dummyResetToken
        };
    },

    // Reset Password Execution
    resetPassword: async function (token, newPassword) {
        if (typeof API !== 'undefined') {
            const apiRes = await API.resetPassword(token, newPassword);
            if (apiRes && apiRes.success) return apiRes;
        }

        const email = localStorage.getItem('resetToken_' + token);
        if (!email) {
            return { success: false, error: 'Invalid or expired password reset token' };
        }

        let users = JSON.parse(localStorage.getItem('quizUsers')) || [];
        const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx !== -1) {
            users[idx].password = newPassword;
            localStorage.setItem('quizUsers', JSON.stringify(users));
            localStorage.removeItem('resetToken_' + token);
            return { success: true, message: 'Password reset successfully! Please login with your new password.' };
        }
        return { success: false, error: 'User account not found' };
    },

    // Toggle Password Visibility
    togglePasswordVisibility: function (inputId, btnEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            if (btnEl) btnEl.innerText = '🙈';
        } else {
            input.type = 'password';
            if (btnEl) btnEl.innerText = '👁️';
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
            <div class="modal-card animate-scale-up">
                <button class="modal-close-btn" onclick="AuthManager.closeAuthModal()">&times;</button>
                <div class="auth-tabs">
                    <button class="auth-tab ${initialTab === 'login' ? 'active' : ''}" onclick="AuthManager.switchTab('login')">Student Login</button>
                    <button class="auth-tab ${initialTab === 'signup' ? 'active' : ''}" onclick="AuthManager.switchTab('signup')">Student Signup</button>
                    <button class="auth-tab ${initialTab === 'admin' ? 'active' : ''}" onclick="AuthManager.switchTab('admin')">Admin Login</button>
                </div>
                
                <div id="authAlert" class="alert-box" style="display:none;"></div>

                <!-- LOGIN FORM -->
                <form id="loginForm" class="auth-form-view" style="${initialTab === 'login' ? 'display:block' : 'display:none'}">
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="loginEmail" class="form-control" placeholder="student@quizpro.com" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="loginPass" class="form-control" placeholder="••••••••" required />
                    </div>
                    <div class="form-row-space">
                        <label class="checkbox-label">
                            <input type="checkbox" id="rememberMe" /> Remember Me
                        </label>
                        <a href="javascript:void(0)" onclick="AuthManager.switchTab('forgot')" class="link-text">Forgot Password?</a>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem;">Log In to Account</button>
                    <button type="button" class="btn btn-outline btn-block" style="margin-top: 0.5rem;" onclick="AuthManager.continueGuest()">Continue as Guest</button>
                </form>

                <!-- SIGNUP FORM -->
                <form id="signupForm" class="auth-form-view" style="${initialTab === 'signup' ? 'display:block' : 'display:none'}">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="signupName" class="form-control" placeholder="e.g. Alex Morgan" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Register Number</label>
                        <input type="text" id="signupReg" class="form-control" placeholder="e.g. BCA2026042" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Department</label>
                        <select id="signupDept" class="form-control" required>
                            <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                            <option value="BSc">BSc (Computer Science / IT)</option>
                            <option value="BCom CA">BCom CA (Computer Applications)</option>
                            <option value="BBA">BBA (Business Administration)</option>
                            <option value="BCom">BCom (General Commerce)</option>
                            <option value="General">General Technical Topics</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="signupEmail" class="form-control" placeholder="alex@university.edu" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Create Password</label>
                        <input type="password" id="signupPass" class="form-control" placeholder="At least 6 characters" required />
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem;">Create Student Account</button>
                </form>

                <!-- ADMIN LOGIN FORM -->
                <form id="adminForm" class="auth-form-view" style="${initialTab === 'admin' ? 'display:block' : 'display:none'}">
                    <div class="form-group">
                        <label class="form-label">Admin Email</label>
                        <input type="email" id="adminEmail" class="form-control" placeholder="admin@quizpro.com" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Admin Password</label>
                        <input type="password" id="adminPass" class="form-control" placeholder="••••••••" required />
                    </div>
                    <button type="submit" class="btn btn-danger btn-block" style="margin-top: 1rem;">Access Admin Portal</button>
                </form>

                <!-- FORGOT PASSWORD FORM -->
                <form id="forgotForm" class="auth-form-view" style="display:none">
                    <h3>Reset Password</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">Enter your email address to receive a password reset link.</p>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="forgotEmail" class="form-control" placeholder="yourname@domain.com" required />
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Send Reset Link</button>
                    <button type="button" class="btn btn-secondary btn-block" style="margin-top:0.5rem" onclick="AuthManager.switchTab('login')">Back to Login</button>
                </form>
            </div>
        `;

        modal.classList.add('active');
        this.attachModalFormListeners();
    },

    switchTab: function (tab) {
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(t => t.classList.remove('active'));

        const views = document.querySelectorAll('.auth-form-view');
        views.forEach(v => v.style.display = 'none');

        const alertBox = document.getElementById('authAlert');
        if (alertBox) alertBox.style.display = 'none';

        if (tab === 'login') {
            if (tabs[0]) tabs[0].classList.add('active');
            document.getElementById('loginForm').style.display = 'block';
        } else if (tab === 'signup') {
            if (tabs[1]) tabs[1].classList.add('active');
            document.getElementById('signupForm').style.display = 'block';
        } else if (tab === 'admin') {
            if (tabs[2]) tabs[2].classList.add('active');
            document.getElementById('adminForm').style.display = 'block';
        } else if (tab === 'forgot') {
            document.getElementById('forgotForm').style.display = 'block';
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
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value.trim();
                const pass = document.getElementById('loginPass').value;
                const rem = document.getElementById('rememberMe').checked;

                const res = await this.login(email, pass, rem);
                if (res.success) {
                    this.closeAuthModal();
                    window.location.href = 'dashboard.html';
                } else {
                    this.showAlert(res.error, 'danger');
                }
            };
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.onsubmit = async (e) => {
                e.preventDefault();
                const data = {
                    name: document.getElementById('signupName').value.trim(),
                    regNumber: document.getElementById('signupReg').value.trim(),
                    department: document.getElementById('signupDept').value,
                    email: document.getElementById('signupEmail').value.trim(),
                    password: document.getElementById('signupPass').value,
                    role: 'student'
                };
                const res = await this.register(data);
                if (res.success) {
                    this.closeAuthModal();
                    window.location.href = 'dashboard.html';
                } else {
                    this.showAlert(res.error, 'danger');
                }
            };
        }

        const adminForm = document.getElementById('adminForm');
        if (adminForm) {
            adminForm.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('adminEmail').value.trim();
                const pass = document.getElementById('adminPass').value;
                const res = await this.login(email, pass, false);
                if (res.success && (res.user.role === 'admin' || email.includes('admin'))) {
                    res.user.role = 'admin';
                    StorageHelper.saveUser(res.user);
                    this.closeAuthModal();
                    window.location.href = 'admin-dashboard.html';
                } else {
                    this.showAlert('Invalid admin credentials', 'danger');
                }
            };
        }

        const forgotForm = document.getElementById('forgotForm');
        if (forgotForm) {
            forgotForm.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('forgotEmail').value.trim();
                const res = await this.forgotPassword(email);
                if (res.success) {
                    this.showAlert(res.message, 'success');
                } else {
                    this.showAlert(res.error, 'danger');
                }
            };
        }
    },

    showAlert: function (msg, type = 'info') {
        const box = document.getElementById('authAlert');
        if (box) {
            box.className = `alert-box alert-${type}`;
            box.innerText = msg;
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
    login: function (username, password) {
        if ((username === 'admin' || username === 'admin@quizpro.com') && (password === 'password123' || password === 'admin')) {
            const adminUser = {
                id: 'usr_admin',
                name: 'System Admin',
                regNumber: 'ADMIN001',
                department: 'BCA',
                email: 'admin@quizpro.com',
                role: 'admin',
                isAdmin: true
            };
            StorageHelper.saveUser(adminUser);
            AuthManager.updateUI();
            return true;
        }
        return false;
    },
    logout: function () {
        AuthManager.logout(true);
    }
};

