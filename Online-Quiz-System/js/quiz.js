/**
 * Advanced Quiz Engine for QuizPro
 * Manages Question State, Question Types (MCQ, True/False, Fill-Blank, Code, Image),
 * Palette Grid, Timer Warnings, Auto-Save/Resume, Bookmarking, and Keyboard Shortcuts.
 */

let currentQuestions = [];
let currentIndex = 0;
let userAnswers = {};      // { questionIndex: answerValue }
let bookmarked = {};       // { questionIndex: boolean }
let quizConfig = {};
let quizTimer = null;
let secondsRemaining = 300;
let totalTimeAllocated = 300;
let quizStartTime = Date.now();

document.addEventListener('DOMContentLoaded', () => {
    initQuizEngine();
    setupKeyboardShortcuts();
});

function initQuizEngine() {
    quizConfig = StorageHelper.getQuizConfig() || { category: 'Python', department: 'BCA', difficulty: 'all' };

    document.getElementById('quizCategoryTitle').innerText = quizConfig.category + ' Assessment';
    document.getElementById('quizDeptBadge').innerText = quizConfig.department || 'BCA';

    // Load Questions
    const allBank = StorageHelper.getQuestions();
    let rawQuestions = allBank[quizConfig.category] || defaultQuizQuestions.Python;

    // Filter by difficulty if specified
    if (quizConfig.difficulty && quizConfig.difficulty !== 'all') {
        const filtered = rawQuestions.filter(q => q.difficulty === quizConfig.difficulty);
        if (filtered.length > 0) rawQuestions = filtered;
    }

    currentQuestions = [...rawQuestions];

    // Check for saved in-progress quiz state
    const savedState = StorageHelper.getQuizState();
    if (savedState && savedState.category === quizConfig.category && savedState.questions && savedState.questions.length > 0) {
        currentQuestions = savedState.questions;
        currentIndex = savedState.currentIndex || 0;
        userAnswers = savedState.userAnswers || {};
        bookmarked = savedState.bookmarked || {};
        secondsRemaining = savedState.secondsRemaining || (currentQuestions.length * 30);
        document.getElementById('resumeBanner').style.display = 'flex';
    } else {
        totalTimeAllocated = currentQuestions.length * 30; // 30s per question
        secondsRemaining = totalTimeAllocated;
    }

    startTimer(secondsRemaining);
    renderPaletteGrid();
    renderQuestion(currentIndex);
}

function startTimer(seconds) {
    if (quizTimer) clearInterval(quizTimer);

    secondsRemaining = seconds;
    const timerText = document.getElementById('timerText');
    const timerBox = document.getElementById('timerBox');

    quizTimer = setInterval(() => {
        secondsRemaining--;
        if (secondsRemaining < 0) {
            clearInterval(quizTimer);
            submitQuizAttempt();
            return;
        }

        const mins = Math.floor(secondsRemaining / 60);
        const secs = secondsRemaining % 60;
        if (timerText) {
            timerText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Warning indicator when time < 10% remaining
        if (secondsRemaining <= (totalTimeAllocated * 0.15)) {
            if (timerBox) timerBox.classList.add('timer-warning');
            QuizAudio.playWarning();
        }

        autoSaveState();
    }, 1000);
}

function renderQuestion(index) {
    if (index < 0 || index >= currentQuestions.length) return;
    currentIndex = index;

    const q = currentQuestions[index];

    // Update Counter & Difficulty Badge
    document.getElementById('questionCounter').innerText = `Question ${index + 1} of ${currentQuestions.length}`;
    const diffBadge = document.getElementById('questionDifficultyBadge');
    if (diffBadge) {
        diffBadge.innerText = (q.difficulty || 'medium').toUpperCase();
        diffBadge.style.background = q.difficulty === 'easy' ? 'var(--success-color)' : (q.difficulty === 'hard' ? 'var(--danger-color)' : 'var(--primary-color)');
    }

    // Question Text
    document.getElementById('questionText').innerText = q.q;

    // Code Snippet Box
    const codeBox = document.getElementById('codeSnippetBox');
    if (q.type === 'code' && q.code) {
        document.getElementById('codeSnippetText').innerText = q.code;
        codeBox.style.display = 'block';
    } else {
        codeBox.style.display = 'none';
    }

    // Image Box
    const imgBox = document.getElementById('imageQuestionBox');
    if (q.type === 'image' && q.image) {
        document.getElementById('imageQuestionContent').innerHTML = q.image.startsWith('data:') || q.image.startsWith('<svg') ? q.image : `<img src="${q.image}" alt="Diagram" />`;
        imgBox.style.display = 'block';
    } else {
        imgBox.style.display = 'none';
    }

    // Fill Blank Box vs Options Box
    const fillBox = document.getElementById('fillBlankBox');
    const optionsContainer = document.getElementById('optionsContainer');

    if (q.type === 'fill_blank') {
        optionsContainer.style.display = 'none';
        fillBox.style.display = 'block';
        const input = document.getElementById('fillBlankInput');
        input.value = userAnswers[index] !== undefined ? userAnswers[index] : '';
    } else {
        fillBox.style.display = 'none';
        optionsContainer.style.display = 'flex';
        renderOptions(q, index);
    }

    // Controls state
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').innerText = index === currentQuestions.length - 1 ? 'Finish →' : 'Next →';
    
    // Bookmark button style
    const bmBtn = document.getElementById('bookmarkBtn');
    if (bmBtn) {
        bmBtn.innerText = bookmarked[index] ? '★ Bookmarked' : '☆ Bookmark';
        bmBtn.style.color = bookmarked[index] ? 'var(--warning-color)' : 'var(--text-primary)';
    }

    updateProgressBar();
    renderPaletteGrid();
    autoSaveState();
}

function renderOptions(q, qIndex) {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    const options = q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
    const letters = ['A', 'B', 'C', 'D'];

    options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (userAnswers[qIndex] === optIdx) {
            btn.classList.add('selected');
        }

        btn.innerHTML = `
            <span class="option-badge">${letters[optIdx] || optIdx + 1}</span>
            <span>${StorageHelper.escapeHTML(optText)}</span>
        `;

        btn.onclick = () => selectOption(qIndex, optIdx);
        container.appendChild(btn);
    });
}

function selectOption(qIndex, optIdx) {
    userAnswers[qIndex] = optIdx;
    QuizAudio.playClick();
    renderQuestion(qIndex);
}

function handleFillBlankInput(val) {
    userAnswers[currentIndex] = val.trim();
    renderPaletteGrid();
}

function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        renderQuestion(currentIndex + 1);
    } else {
        confirmFinishQuiz();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        renderQuestion(currentIndex - 1);
    }
}

function skipQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        renderQuestion(currentIndex + 1);
    }
}

function toggleBookmarkCurrent() {
    bookmarked[currentIndex] = !bookmarked[currentIndex];
    QuizAudio.playClick();
    renderQuestion(currentIndex);
}

function updateProgressBar() {
    const bar = document.getElementById('progressBar');
    if (bar) {
        const pct = Math.round(((currentIndex + 1) / currentQuestions.length) * 100);
        bar.style.width = pct + '%';
    }
}

function renderPaletteGrid() {
    const grid = document.getElementById('paletteGrid');
    if (!grid) return;

    grid.innerHTML = '';
    currentQuestions.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        
        if (idx === currentIndex) btn.classList.add('current');
        if (userAnswers[idx] !== undefined && userAnswers[idx] !== '') btn.classList.add('answered');
        if (bookmarked[idx]) btn.classList.add('bookmarked');

        btn.innerText = idx + 1;
        btn.onclick = () => renderQuestion(idx);
        grid.appendChild(btn);
    });
}

function autoSaveState() {
    StorageHelper.saveQuizState({
        category: quizConfig.category,
        questions: currentQuestions,
        currentIndex,
        userAnswers,
        bookmarked,
        secondsRemaining
    });
}

function confirmFinishQuiz() {
    const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== undefined && userAnswers[k] !== '').length;
    document.getElementById('finishSummaryText').innerText = `You have answered ${answeredCount} of ${currentQuestions.length} questions. Are you ready to submit?`;
    document.getElementById('finishModal').classList.add('active');
}

function submitQuizAttempt() {
    if (quizTimer) clearInterval(quizTimer);
    StorageHelper.clearQuizState();

    let score = 0;
    const reviewData = [];

    currentQuestions.forEach((q, idx) => {
        const userAns = userAnswers[idx];
        let isCorrect = false;

        if (q.type === 'fill_blank') {
            isCorrect = String(userAns || '').toLowerCase() === String(q.answer).toLowerCase();
        } else {
            isCorrect = userAns === q.answer;
        }

        if (isCorrect) score++;

        reviewData.push({
            question: q.q,
            type: q.type,
            code: q.code,
            image: q.image,
            options: q.options,
            userAnswer: userAns,
            correctAnswer: q.answer,
            isCorrect: isCorrect,
            explanation: q.explanation || 'No explanation available.'
        });
    });

    const total = currentQuestions.length;
    const pct = Math.round((score / total) * 100);
    const user = StorageHelper.getUser() || { name: 'Student Learner', department: 'BCA' };
    const timeTaken = Math.max(10, Math.round((Date.now() - quizStartTime) / 1000));

    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B';
    else if (pct >= 50) grade = 'C';

    const resultPayload = {
        user: user,
        category: quizConfig.category,
        department: quizConfig.department || 'BCA',
        score: score,
        total: total,
        percentage: pct,
        grade: grade,
        timeTaken: timeTaken,
        reviewData: reviewData,
        date: new Date().toISOString()
    };

    // Save locally
    StorageHelper.saveAttempt(resultPayload);
    localStorage.setItem('latestQuizResult', JSON.stringify(resultPayload));

    // Submit API if available
    if (typeof API !== 'undefined' && API.getToken()) {
        API.submitQuiz({
            category: quizConfig.category,
            score,
            total
        });
    }

    QuizAudio.playComplete();
    window.location.href = 'result.html';
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toUpperCase();
        if (['1', '2', '3', '4'].includes(key)) {
            selectOption(currentIndex, parseInt(key) - 1);
        } else if (['A', 'B', 'C', 'D'].includes(key) && key !== 'B') {
            const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
            selectOption(currentIndex, map[key]);
        } else if (key === 'N') {
            nextQuestion();
        } else if (key === 'P') {
            prevQuestion();
        } else if (key === 'B') {
            toggleBookmarkCurrent();
        } else if (key === 'F') {
            confirmFinishQuiz();
        }
    });
}
