document.addEventListener('DOMContentLoaded', () => {
    // Check if user and config exist
    const user = StorageHelper.getUser();
    const config = StorageHelper.getQuizConfig();
    
    if (!user || !config) {
        window.location.href = 'index.html';
        return;
    }

    // UI Elements
    document.getElementById('user-display').textContent = `Hello, ${user.name}`;
    document.getElementById('category-display').textContent = config.category;
    document.getElementById('difficulty-display').textContent = config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1);
    
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.textContent = StorageHelper.getSettings().theme === 'dark' ? '☀️' : '🌙';
    themeBtn.addEventListener('click', () => {
        themeBtn.textContent = StorageHelper.toggleTheme() === 'dark' ? '☀️' : '🌙';
    });

    // Quiz State
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    
    let quizResult = {
        user: user,
        category: config.category,
        difficulty: config.difficulty,
        date: new Date().toISOString(),
        score: 0,
        total: 10,
        answers: new Array(10).fill(null), // Fixed size array
        totalTimeTaken: 0
    };

    const timer = new QuizTimer(30, document.getElementById('time-left'), handleTimeout);
    const quizSettings = StorageHelper.getSettings();

    // Audio Context for Sound Effects
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;
    function playBeep(isCorrect) {
        if (!quizSettings.sound) return;
        if (!audioCtx) audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(isCorrect ? 800 : 300, audioCtx.currentTime); // High pitch for correct, low for wrong
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    }

    // Initialize Quiz
    function initQuiz() {
        const questionsDB = StorageHelper.getQuestions();
        let categoryQs = [];
        if (questionsDB[config.category]) {
            categoryQs = [...questionsDB[config.category]];
        }
        
        if (categoryQs.length === 0) {
            alert(`Oops! There are no questions populated for "${config.category}" yet.\nPlease select a different category (like HTML, CSS, JavaScript, etc.) for now.`);
            window.location.href = 'instructions.html';
            return;
        }
        
        // Shuffle questions
        for (let i = categoryQs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [categoryQs[i], categoryQs[j]] = [categoryQs[j], categoryQs[i]];
        }
        
        // Take top 10 and map to shuffle options
        currentQuestions = categoryQs.slice(0, 10).map(q => {
            const correctAnswerText = q.options[q.answer];
            
            // Create array of objects to shuffle
            let shuffledOptions = q.options.map((text, idx) => ({ text, isCorrect: idx === q.answer }));
            
            // Shuffle options
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }
            
            return {
                ...q,
                shuffledOptions: shuffledOptions,
                correctAnswerText: correctAnswerText
            };
        });
        
        loadQuestion();
    }

    function loadQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        const existingAnswer = quizResult.answers[currentQuestionIndex];
        
        // Update header and progress
        document.getElementById('question-count').textContent = `Question: ${currentQuestionIndex + 1}/${currentQuestions.length}`;
        document.getElementById('progress-bar').style.width = `${((currentQuestionIndex) / currentQuestions.length) * 100}%`;
        document.getElementById('question-text').textContent = `${currentQuestionIndex + 1}. ${q.q}`;
        
        // Navigation Buttons State
        document.getElementById('prev-btn').style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';
        
        const isLast = currentQuestionIndex === currentQuestions.length - 1;
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('finish-btn').style.display = 'none';
        document.getElementById('skip-btn').style.display = 'none';
        
        if (existingAnswer) {
            // Already answered, just show Next/Finish
            if (isLast) document.getElementById('finish-btn').style.display = 'inline-flex';
            else document.getElementById('next-btn').style.display = 'inline-flex';
        } else {
            // Not answered yet, show Skip
            document.getElementById('skip-btn').style.display = 'inline-flex';
        }

        // Render options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        q.shuffledOptions.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn animate-fade-in';
            btn.style.animationDelay = `${index * 0.1}s`;
            btn.textContent = opt.text;
            
            // If already answered, render locked state
            if (existingAnswer) {
                btn.disabled = true;
                btn.style.cursor = 'not-allowed';
                
                if (opt.isCorrect) {
                    btn.classList.add('correct'); // Always highlight correct answer
                } else if (existingAnswer.userAnswer === opt.text) {
                    btn.classList.add('wrong'); // Highlight user's wrong answer
                }
            } else {
                btn.onclick = () => selectOption(opt, btn);
            }
            
            optionsContainer.appendChild(btn);
        });
        
        // Handle Timer Visibility & Logic
        if (!quizSettings.timer) {
            document.querySelector('.timer-box').style.display = 'none';
        }

        if (existingAnswer) {
            timer.stop();
            if(quizSettings.timer) document.getElementById('time-left').textContent = '-';
        } else {
            if(quizSettings.timer) timer.start();
        }
    }

    function selectOption(selectedOpt, btnEl) {
        timer.stop();
        const timeTaken = timer.getTimeTaken();
        quizResult.totalTimeTaken += timeTaken;
        
        const q = currentQuestions[currentQuestionIndex];
        
        // Apply immediate validation styles
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => {
            b.disabled = true; // Lock all buttons
            b.style.cursor = 'not-allowed';
            if (b.textContent === q.correctAnswerText) {
                b.classList.add('correct');
            }
        });
        
        if (!selectedOpt.isCorrect) {
            btnEl.classList.add('wrong');
            playBeep(false);
        } else {
            quizResult.score++;
            playBeep(true);
        }
        
        // Save answer state
        quizResult.answers[currentQuestionIndex] = {
            questionId: q.id,
            questionText: q.q,
            userAnswer: selectedOpt.text,
            correctAnswer: q.correctAnswerText,
            isCorrect: selectedOpt.isCorrect,
            explanation: q.explanation,
            timeTaken: timeTaken
        };
        
        // Toggle Buttons
        document.getElementById('skip-btn').style.display = 'none';
        if (currentQuestionIndex === currentQuestions.length - 1) {
            document.getElementById('finish-btn').style.display = 'inline-flex';
        } else {
            document.getElementById('next-btn').style.display = 'inline-flex';
        }
    }

    function handleTimeout() {
        // Auto-skip when time runs out
        timer.stop();
        const q = currentQuestions[currentQuestionIndex];
        
        quizResult.answers[currentQuestionIndex] = {
            questionId: q.id,
            questionText: q.q,
            userAnswer: null, // Unanswered
            correctAnswer: q.correctAnswerText,
            isCorrect: false,
            explanation: q.explanation,
            timeTaken: 30
        };
        quizResult.totalTimeTaken += 30;

        goNext();
    }

    function goNext() {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            finishQuiz();
        }
    }

    // Button Listeners
    document.getElementById('next-btn').addEventListener('click', goNext);
    
    document.getElementById('skip-btn').addEventListener('click', () => {
        timer.stop();
        const q = currentQuestions[currentQuestionIndex];
        const timeTaken = timer.getTimeTaken();
        
        quizResult.answers[currentQuestionIndex] = {
            questionId: q.id,
            questionText: q.q,
            userAnswer: null, // Skipped
            correctAnswer: q.correctAnswerText,
            isCorrect: false,
            explanation: q.explanation,
            timeTaken: timeTaken
        };
        quizResult.totalTimeTaken += timeTaken;
        
        goNext();
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            if (!quizResult.answers[currentQuestionIndex]) {
                timer.stop(); // Stop timer if navigating away from an active question
            }
            currentQuestionIndex--;
            loadQuestion();
        }
    });

    document.getElementById('finish-btn').addEventListener('click', finishQuiz);

    function finishQuiz() {
        // Calculate final score
        quizResult.score = quizResult.answers.filter(a => a && a.isCorrect).length;
        document.getElementById('progress-bar').style.width = '100%';
        StorageHelper.saveAttempt(quizResult);
        StorageHelper.saveQuizState(quizResult); // For result/review pages
        window.location.href = 'result.html';
    }

    // Start
    initQuiz();
});
