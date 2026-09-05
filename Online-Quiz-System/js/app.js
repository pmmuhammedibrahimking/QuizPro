document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const userForm = document.getElementById('user-form');
    
    // Set initial theme icon
    const settings = StorageHelper.getSettings();
    if (themeBtn) {
        themeBtn.textContent = settings.theme === 'dark' ? '☀️' : '🌙';

        // Theme toggle listener
        themeBtn.addEventListener('click', () => {
            const newTheme = StorageHelper.toggleTheme();
            themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }

    // Handle user form submission
    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = {
                name: document.getElementById('name').value,
                regNumber: document.getElementById('regNumber').value,
                department: document.getElementById('department').value,
                email: document.getElementById('email').value
            };
            
            StorageHelper.saveUser(user);
            
            // Navigate to instructions page
            window.location.href = 'instructions.html';
        });
    }

    // Auto-fill if user already exists in storage
    const existingUser = StorageHelper.getUser();
    if (existingUser && userForm) {
        document.getElementById('name').value = existingUser.name || '';
        document.getElementById('regNumber').value = existingUser.regNumber || '';
        document.getElementById('department').value = existingUser.department || '';
        if (document.getElementById('email')) {
            document.getElementById('email').value = existingUser.email || '';
        }
    }
});
