/**
 * Result Page Controller for QuizPro
 * Animates score ring gauge, calculates grades & ranks, draws Canvas Analytics,
 * and configures Certificate export link.
 */

document.addEventListener('DOMContentLoaded', () => {
    let result = null;
    try {
        result = JSON.parse(localStorage.getItem('latestQuizResult'));
    } catch(e) { result = null; }

    if (!result) {
        // Fallback demo result if none found
        result = {
            user: StorageHelper.getUser() || { name: 'Student Learner', department: 'BCA', regNumber: 'BCA2026001' },
            category: 'Python',
            department: 'BCA',
            score: 8,
            total: 10,
            percentage: 80,
            grade: 'A',
            timeTaken: 145,
            reviewData: [],
            date: new Date().toISOString()
        };
    }

    renderResultView(result);
    drawPerformanceChart(result);
});

function renderResultView(result) {
    const user = result.user || { name: 'Student', department: 'BCA' };
    const pct = result.percentage || Math.round((result.score / result.total) * 100);
    const pass = pct >= 50;

    document.getElementById('resDeptBadge').innerText = (result.department || user.department || 'BCA') + ' Department';
    document.getElementById('resSubjectTitle').innerText = (result.category || 'Quiz') + ' Assessment Result';
    document.getElementById('resStudentName').innerText = `Student: ${user.name} (${user.regNumber || 'N/A'})`;

    // Percentage & Circular Ring Gauge
    const gaugeRing = document.getElementById('scoreGaugeRing');
    if (gaugeRing) {
        const color = pass ? 'var(--success-color)' : 'var(--danger-color)';
        gaugeRing.style.background = `conic-gradient(${color} ${pct}%, rgba(99, 102, 241, 0.15) ${pct}%)`;
    }

    document.getElementById('resPercentageText').innerText = pct + '%';
    document.getElementById('resGradeBadge').innerText = 'Grade ' + (result.grade || (pct >= 90 ? 'A+' : (pct >= 80 ? 'A' : (pct >= 70 ? 'B' : (pct >= 50 ? 'C' : 'F')))));

    // Pass / Fail Badge
    const pfBadge = document.getElementById('resPassFailBadge');
    if (pfBadge) {
        pfBadge.innerText = pass ? '🎉 PASSED' : '❌ FAILED';
        pfBadge.style.background = pass ? 'var(--success-color)' : 'var(--danger-color)';
    }

    // Stats Grid
    document.getElementById('resScoreText').innerText = `${result.score} / ${result.total}`;
    document.getElementById('resWrongText').innerText = `${result.total - result.score}`;
    
    const mins = Math.floor((result.timeTaken || 0) / 60);
    const secs = (result.timeTaken || 0) % 60;
    document.getElementById('resTimeText').innerText = `${mins}m ${secs}s`;

    // Rank Calculation based on Leaderboard position
    const leaderboard = StorageHelper.getLeaderboard();
    let rank = 1;
    if (leaderboard.length > 0) {
        const idx = leaderboard.findIndex(l => l.score === result.score && l.name === user.name);
        if (idx !== -1) rank = idx + 1;
        else rank = Math.max(1, Math.ceil(leaderboard.length * (1 - (pct / 100))));
    }
    document.getElementById('resRankText').innerText = `Rank #${rank}`;

    // Certificate Button state
    const certBtn = document.getElementById('certDownloadBtn');
    if (certBtn) {
        if (!pass) {
            certBtn.style.display = 'none';
        } else {
            certBtn.style.display = 'inline-flex';
        }
    }
}

function drawPerformanceChart(result) {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    const correct = result.score;
    const wrong = result.total - result.score;
    const total = result.total || 1;

    // Draw Bar Graph
    const barWidth = 60;
    const spacing = 80;
    const startX = (width - (2 * barWidth + spacing)) / 2;
    const maxBarHeight = height - 70;

    const correctHeight = (correct / total) * maxBarHeight;
    const wrongHeight = (wrong / total) * maxBarHeight;

    // Correct Bar
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(startX, height - 40 - correctHeight, barWidth, correctHeight, [8, 8, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${correct}`, startX + barWidth / 2, height - 45 - correctHeight);
    ctx.fillText('Correct', startX + barWidth / 2, height - 20);

    // Wrong Bar
    const wrongX = startX + barWidth + spacing;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(wrongX, height - 40 - wrongHeight, barWidth, wrongHeight, [8, 8, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${wrong}`, wrongX + barWidth / 2, height - 45 - wrongHeight);
    ctx.fillText('Wrong', wrongX + barWidth / 2, height - 20);
}

function shareResultCard() {
    let result = null;
    try { result = JSON.parse(localStorage.getItem('latestQuizResult')); } catch(e) {}
    const scoreText = result ? `I scored ${result.percentage}% in ${result.category} on QuizPro!` : 'Check out QuizPro Examination Platform!';
    
    if (navigator.share) {
        navigator.share({
            title: 'QuizPro Score',
            text: scoreText,
            url: window.location.href
        }).catch(err => console.debug(err));
    } else {
        navigator.clipboard.writeText(scoreText + ' ' + window.location.href);
        alert('Result score copied to clipboard!');
    }
}
