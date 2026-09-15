/**
 * Admin Question Management Controller for QuizPro
 * Supports CRUD operations across MCQs, True/False, Fill in Blank, Code, and Image questions.
 */

let allBank = {};
let currentSelectedSubject = 'Python';

document.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isAdmin()) {
        AuthManager.ensureAdminSession();
    }

    allBank = StorageHelper.getQuestions();
    populateCategoryDropdowns();
    loadQuestionsList();
    setupFormSubmission();
});

function populateCategoryDropdowns() {
    const sel = document.getElementById('adminSubjectSelect');
    const modalSel = document.getElementById('qCategory');
    if (!sel || !modalSel) return;

    const categories = Object.keys(allBank);
    sel.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    modalSel.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    currentSelectedSubject = categories[0] || 'Python';
}

function loadQuestionsList() {
    const sel = document.getElementById('adminSubjectSelect');
    if (sel) currentSelectedSubject = sel.value;

    const list = allBank[currentSelectedSubject] || [];
    renderQuestionsContainer(list);
}

function filterAdminQuestions() {
    const query = document.getElementById('adminSearchInput').value.toLowerCase();
    const list = allBank[currentSelectedSubject] || [];
    const filtered = list.filter(q => q.q.toLowerCase().includes(query));
    renderQuestionsContainer(filtered);
}

function renderQuestionsContainer(questions) {
    const container = document.getElementById('adminQuestionsContainer');
    if (!container) return;

    if (questions.length === 0) {
        container.innerHTML = `<div class="card text-center"><p style="color: var(--text-secondary);">No questions found for this subject.</p></div>`;
        return;
    }

    container.innerHTML = questions.map((q, idx) => {
        return `
            <div class="card animate-fade-in" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <span class="badge badge-student">${(q.type || 'MCQ').toUpperCase()}</span>
                        <span class="badge" style="background: var(--secondary-color); color: white;">${(q.difficulty || 'medium').toUpperCase()}</span>
                        <h4 style="margin: 0.5rem 0 0.25rem 0;">${idx + 1}. ${StorageHelper.escapeHTML(q.q)}</h4>
                        <small style="color: var(--text-secondary);">Explanation: ${StorageHelper.escapeHTML(q.explanation || 'N/A')}</small>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="btn btn-secondary btn-sm" onclick="editQuestionItem('${q.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteQuestionItem('${q.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openQuestionModal(qData = null) {
    const modal = document.getElementById('questionModal');
    const form = document.getElementById('questionForm');
    form.reset();

    if (qData) {
        document.getElementById('modalTitle').innerText = 'Edit Question';
        document.getElementById('qId').value = qData.id;
        document.getElementById('qCategory').value = currentSelectedSubject;
        document.getElementById('qDifficulty').value = qData.difficulty || 'medium';
        document.getElementById('qType').value = qData.type || 'mcq';
        document.getElementById('qText').value = qData.q;
        document.getElementById('qExplanation').value = qData.explanation || '';

        if (qData.code) document.getElementById('qCode').value = qData.code;
        if (qData.image) document.getElementById('qImage').value = qData.image;

        if (qData.options && Array.isArray(qData.options)) {
            qData.options.forEach((opt, idx) => {
                const el = document.getElementById('opt' + idx);
                if (el) el.value = opt;
            });
            document.getElementById('qAnswerIdx').value = qData.answer;
        }

        if (qData.type === 'fill_blank') {
            document.getElementById('qFillAnswer').value = qData.answer;
        }

        toggleTypeFields(qData.type || 'mcq');
    } else {
        document.getElementById('modalTitle').innerText = 'Add New Question';
        document.getElementById('qId').value = '';
        document.getElementById('qCategory').value = currentSelectedSubject;
        toggleTypeFields('mcq');
    }

    modal.classList.add('active');
}

function closeQuestionModal() {
    const modal = document.getElementById('questionModal');
    if (modal) modal.classList.remove('active');
}

function toggleTypeFields(type) {
    document.getElementById('fieldCode').style.display = type === 'code' ? 'block' : 'none';
    document.getElementById('fieldImage').style.display = type === 'image' ? 'block' : 'none';
    document.getElementById('fieldOptions').style.display = (type === 'mcq' || type === 'code' || type === 'image') ? 'block' : 'none';
    document.getElementById('fieldFillBlank').style.display = type === 'fill_blank' ? 'block' : 'none';

    if (type === 'true_false') {
        document.getElementById('opt0').value = 'True';
        document.getElementById('opt1').value = 'False';
        document.getElementById('opt2').value = '';
        document.getElementById('opt3').value = '';
        document.getElementById('fieldOptions').style.display = 'block';
    }
}

function setupFormSubmission() {
    const form = document.getElementById('questionForm');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('qId').value || ('q_' + Date.now());
        const cat = document.getElementById('qCategory').value;
        const type = document.getElementById('qType').value;
        const diff = document.getElementById('qDifficulty').value;
        const qText = document.getElementById('qText').value.trim();
        const explanation = document.getElementById('qExplanation').value.trim();

        const qObj = {
            id,
            type,
            difficulty: diff,
            q: qText,
            explanation
        };

        if (type === 'code') qObj.code = document.getElementById('qCode').value;
        if (type === 'image') qObj.image = document.getElementById('qImage').value;

        if (type === 'fill_blank') {
            qObj.answer = document.getElementById('qFillAnswer').value.trim();
        } else {
            qObj.options = [
                document.getElementById('opt0').value.trim(),
                document.getElementById('opt1').value.trim(),
                document.getElementById('opt2').value.trim(),
                document.getElementById('opt3').value.trim()
            ].filter(o => o.length > 0);
            qObj.answer = parseInt(document.getElementById('qAnswerIdx').value);
        }

        if (!allBank[cat]) allBank[cat] = [];

        const idx = allBank[cat].findIndex(q => q.id === id);
        if (idx !== -1) allBank[cat][idx] = qObj;
        else allBank[cat].push(qObj);

        StorageHelper.saveQuestions(allBank);

        // Submit API if available
        if (typeof API !== 'undefined' && API.getToken()) {
            if (idx !== -1) API.updateQuestion(id, qObj);
            else API.addQuestion(qObj);
        }

        closeQuestionModal();
        loadQuestionsList();
    };
}

function editQuestionItem(id) {
    const list = allBank[currentSelectedSubject] || [];
    const qData = list.find(q => q.id === id);
    if (qData) openQuestionModal(qData);
}

function deleteQuestionItem(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;

    if (allBank[currentSelectedSubject]) {
        allBank[currentSelectedSubject] = allBank[currentSelectedSubject].filter(q => q.id !== id);
        StorageHelper.saveQuestions(allBank);
    }

    if (typeof API !== 'undefined' && API.getToken()) {
        API.deleteQuestion(id);
    }

    loadQuestionsList();
}
