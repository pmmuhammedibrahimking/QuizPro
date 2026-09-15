/**
 * NexusPulse Theme & Responsive Navigation Controller
 */
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('nexuspulse_theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(savedTheme);
        this.bindEvents();
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nexuspulse_theme', theme);
        
        // Update toggle icons if present
        const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
            btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
        });
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    bindEvents() {
        // Theme toggle button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle-btn')) {
                this.toggleTheme();
            }
        });
    }
};

const NavigationDrawer = {
    init() {
        this.drawer = document.getElementById('mobileDrawer');
        this.overlay = document.getElementById('drawerOverlay');
        this.toggleBtn = document.getElementById('mobileToggleBtn');
        this.closeBtn = document.getElementById('drawerCloseBtn');

        if (!this.drawer) return;

        this.bindEvents();
    },

    open() {
        this.drawer.classList.add('open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.drawer.classList.remove('open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    bindEvents() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.open());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.drawer.classList.contains('open')) {
                this.close();
            }
        });

        // Close drawer when clicking any nav item inside it
        const drawerLinks = this.drawer.querySelectorAll('.nav-link');
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    NavigationDrawer.init();
});
