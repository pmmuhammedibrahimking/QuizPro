document.addEventListener('DOMContentLoaded', () => {
    StorageHelper.applyTheme();
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.textContent = StorageHelper.getSettings().theme === 'dark' ? '☀️' : '🌙';
        themeBtn.addEventListener('click', () => {
            themeBtn.textContent = StorageHelper.toggleTheme() === 'dark' ? '☀️' : '🌙';
        });
    }

    let questionsDB = StorageHelper.getQuestions();
    
    // UI Elements
    const tbody = document.getElementById('questions-tbody');
    const searchInput = document.getElementById('search-input');
    const catFilter = document.getElementById('category-filter');
    const modal = document.getElementById('q-modal');
    const form = document.getElementById('q-form');
    
    function renderTable() {
        tbody.innerHTML = '';
        const searchVal = searchInput.value.toLowerCase();
        const catVal = catFilter.value;
        
        for (const category in questionsDB) {
            if (catVal !== 'All' && category !== catVal) continue;
            
            questionsDB[category].forEach(q => {
                // Search filter
                if (searchVal && !q.q.toLowerCase().includes(searchVal)) return;

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid var(--border-color)';
                tr.innerHTML = `
                    <td style="padding: 1rem;">${category}</td>
                    <td style="padding: 1rem;">${q.q}</td>
                    <td style="padding: 1rem;">${q.options[q.answer]}</td>
                    <td style="padding: 1rem; text-align: right; white-space: nowrap;">
                        <button class="btn btn-secondary action-btn edit-btn" data-cat="${category}" data-id="${q.id}">Edit</button>
                        <button class="btn btn-secondary action-btn del-btn" data-cat="${category}" data-id="${q.id}" style="color: var(--danger-color); border-color: var(--danger-color);">Del</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        // Attach event listeners to generated buttons
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.del-btn').forEach(btn => btn.addEventListener('click', handleDelete));
    }

    // Handlers
    searchInput.addEventListener('input', renderTable);
    catFilter.addEventListener('change', renderTable);

    function handleDelete(e) {
        if (!confirm('Are you sure you want to delete this question?')) return;
        const cat = e.target.dataset.cat;
        const id = e.target.dataset.id;
        
        questionsDB[cat] = questionsDB[cat].filter(q => q.id !== id);
        StorageHelper.saveQuestions(questionsDB);
        renderTable();
    }

    function handleEdit(e) {
        const cat = e.target.dataset.cat;
        const id = e.target.dataset.id;
        const q = questionsDB[cat].find(qu => qu.id === id);
        
        document.getElementById('modal-title').textContent = 'Edit Question';
        document.getElementById('edit-id').value = q.id;
        document.getElementById('edit-original-cat').value = cat;
        document.getElementById('modal-category').value = cat;
        document.getElementById('modal-q').value = q.q;
        document.getElementById('modal-opt0').value = q.options[0];
        document.getElementById('modal-opt1').value = q.options[1];
        document.getElementById('modal-opt2').value = q.options[2];
        document.getElementById('modal-opt3').value = q.options[3];
        document.getElementById('modal-answer').value = q.answer;
        document.getElementById('modal-exp').value = q.explanation;
        
        modal.style.display = 'flex';
    }

    document.getElementById('add-q-btn').addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Question';
        form.reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('edit-original-cat').value = '';
        modal.style.display = 'flex';
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newCat = document.getElementById('modal-category').value;
        const oldCat = document.getElementById('edit-original-cat').value;
        const id = document.getElementById('edit-id').value || 'q' + Date.now();
        
        const newQ = {
            id: id,
            q: document.getElementById('modal-q').value,
            options: [
                document.getElementById('modal-opt0').value,
                document.getElementById('modal-opt1').value,
                document.getElementById('modal-opt2').value,
                document.getElementById('modal-opt3').value
            ],
            answer: parseInt(document.getElementById('modal-answer').value),
            explanation: document.getElementById('modal-exp').value
        };

        if (oldCat && oldCat !== newCat) {
            // Category changed, remove from old
            questionsDB[oldCat] = questionsDB[oldCat].filter(q => q.id !== id);
        }

        if (!questionsDB[newCat]) questionsDB[newCat] = [];
        
        if (oldCat && oldCat === newCat) {
            // Update existing in same category
            const idx = questionsDB[newCat].findIndex(q => q.id === id);
            if (idx !== -1) questionsDB[newCat][idx] = newQ;
            else questionsDB[newCat].push(newQ);
        } else {
            // Add new
            questionsDB[newCat].push(newQ);
        }

        StorageHelper.saveQuestions(questionsDB);
        modal.style.display = 'none';
        renderTable();
    });

    // Initial render
    renderTable();
});
