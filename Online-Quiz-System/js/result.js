document.addEventListener('DOMContentLoaded', () => {
    const result = StorageHelper.getQuizState();
    if (!result) {
        window.location.href = 'index.html';
        return;
    }

    // Theme setup
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.textContent = StorageHelper.getSettings().theme === 'dark' ? '☀️' : '🌙';
        themeBtn.addEventListener('click', () => {
            themeBtn.textContent = StorageHelper.toggleTheme() === 'dark' ? '☀️' : '🌙';
        });
    }

    // Calculate Grade
    const percentage = (result.score / result.total) * 100;
    let grade = 'Fail';
    let gradeColor = 'var(--danger-color)';

    if (percentage >= 90) { grade = 'A+'; gradeColor = 'var(--success-color)'; }
    else if (percentage >= 80) { grade = 'A'; gradeColor = 'var(--success-color)'; }
    else if (percentage >= 70) { grade = 'B'; gradeColor = 'var(--warning-color)'; }
    else if (percentage >= 60) { grade = 'C'; gradeColor = 'var(--warning-color)'; }

    // Result Page specific logic
    if (document.getElementById('grade-badge')) {
        document.getElementById('grade-badge').textContent = grade;
        document.getElementById('grade-badge').style.backgroundColor = gradeColor;
        document.getElementById('score-text').textContent = `You scored ${result.score} out of ${result.total}`;
        document.getElementById('percentage-text').textContent = `(${percentage.toFixed(1)}%)`;

        let correct = 0;
        let wrong = 0;
        let unanswered = 0;

        result.answers.forEach(a => {
            if (a.userAnswer === null) unanswered++;
            else if (a.isCorrect) correct++;
            else wrong++;
        });

        document.getElementById('correct-answers').textContent = correct;
        document.getElementById('wrong-answers').textContent = wrong;
        document.getElementById('unanswered').textContent = unanswered;
        document.getElementById('time-taken').textContent = `${result.totalTimeTaken}s`;

        // Setup Certificate if passed
        if (percentage >= 60) {
            document.getElementById('certificate-container').style.display = 'block';
            document.getElementById('print-btn').style.display = 'inline-flex';
            
            document.getElementById('cert-name').textContent = result.user.name;
            document.getElementById('cert-category').textContent = result.category;
            document.getElementById('cert-score').textContent = `${percentage.toFixed(1)}%`;
            document.getElementById('cert-grade').textContent = grade;
            document.getElementById('cert-date').textContent = new Date(result.date).toLocaleDateString();

            document.getElementById('print-btn').addEventListener('click', () => {
                window.print();
            });
        }
    }

    // Review Page specific logic
    if (document.getElementById('review-container')) {
        const container = document.getElementById('review-container');
        result.answers.forEach((ans, index) => {
            const item = document.createElement('div');
            item.className = `review-item animate-fade-in ${ans.isCorrect ? 'correct' : 'wrong'}`;
            item.style.animationDelay = `${index * 0.1}s`;

            const userAnswerText = ans.userAnswer === null ? 'Not Answered' : ans.userAnswer;
            
            item.innerHTML = `
                <div class="review-question">${index + 1}. ${ans.questionText}</div>
                <div class="review-answer"><strong>Your Answer:</strong> <span style="color: ${ans.isCorrect ? 'var(--success-color)' : 'var(--danger-color)'}">${userAnswerText}</span></div>
                ${!ans.isCorrect ? `<div class="review-answer"><strong>Correct Answer:</strong> <span style="color: var(--success-color)">${ans.correctAnswer}</span></div>` : ''}
                <div class="review-explanation"><strong>Explanation:</strong> ${ans.explanation}</div>
            `;
            container.appendChild(item);
        });
    }
});
