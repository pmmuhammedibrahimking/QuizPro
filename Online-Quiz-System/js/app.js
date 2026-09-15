document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const userForm = document.getElementById('user-form');
    const userFormModal = document.getElementById('user-form-modal');
    const regModal = document.getElementById('registration-modal');
    const startQuizBtn = document.getElementById('start-quiz-modal-btn');
    const closeRegModalBtn = document.getElementById('close-reg-modal');
    
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

    // Modal display triggers
    if (startQuizBtn && regModal) {
        startQuizBtn.addEventListener('click', (e) => {
            e.preventDefault();
            regModal.style.display = 'flex';
        });
    }

    const closeRegModal = () => {
        if (regModal) regModal.style.display = 'none';
    };

    if (closeRegModalBtn) {
        closeRegModalBtn.addEventListener('click', closeRegModal);
    }

    if (regModal) {
        regModal.addEventListener('click', (e) => {
            if (e.target === regModal) closeRegModal();
        });
    }

    // Save user helper
    const saveAndRedirect = (name, regNumber, department, email) => {
        const user = { name, regNumber, department, email };
        StorageHelper.saveUser(user);
        window.location.href = 'instructions.html';
    };

    // Handle section form submission
    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAndRedirect(
                document.getElementById('name').value,
                document.getElementById('regNumber').value,
                document.getElementById('department').value,
                document.getElementById('email').value
            );
        });
    }

    // Handle modal popup form submission
    if (userFormModal) {
        userFormModal.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAndRedirect(
                document.getElementById('modal-name').value,
                document.getElementById('modal-regNumber').value,
                document.getElementById('modal-department').value,
                document.getElementById('modal-email').value
            );
        });
    }

    // Auto-fill existing user data
    const existingUser = StorageHelper.getUser();
    if (existingUser) {
        if (document.getElementById('name')) document.getElementById('name').value = existingUser.name || '';
        if (document.getElementById('regNumber')) document.getElementById('regNumber').value = existingUser.regNumber || '';
        if (document.getElementById('department')) document.getElementById('department').value = existingUser.department || '';
        if (document.getElementById('email')) document.getElementById('email').value = existingUser.email || '';

        if (document.getElementById('modal-name')) document.getElementById('modal-name').value = existingUser.name || '';
        if (document.getElementById('modal-regNumber')) document.getElementById('modal-regNumber').value = existingUser.regNumber || '';
        if (document.getElementById('modal-department')) document.getElementById('modal-department').value = existingUser.department || '';
        if (document.getElementById('modal-email')) document.getElementById('modal-email').value = existingUser.email || '';
    }
});
