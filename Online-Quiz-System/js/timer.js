class QuizTimer {
    constructor(duration, displayElement, onTimeout) {
        this.duration = duration;
        this.timeLeft = duration;
        this.displayElement = displayElement;
        this.onTimeout = onTimeout;
        this.interval = null;
    }

    start() {
        this.timeLeft = this.duration;
        this.updateDisplay();
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 5) {
                this.displayElement.parentElement.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
            }
            
            if (this.timeLeft <= 0) {
                this.stop();
                if (typeof this.onTimeout === 'function') {
                    this.onTimeout();
                }
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.interval);
        this.displayElement.parentElement.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    }

    reset() {
        this.stop();
        this.timeLeft = this.duration;
        this.updateDisplay();
    }
    
    getTimeTaken() {
        return this.duration - this.timeLeft;
    }

    updateDisplay() {
        if(this.displayElement) {
            this.displayElement.textContent = this.timeLeft;
        }
    }
}
