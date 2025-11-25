
const EXAM_DURATION_MINUTES = 180; // 3 hours

let remainingSeconds = EXAM_DURATION_MINUTES * 60;
let intervalId = null;

    function formatTime(totalSeconds) {
            const hours   = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const h = String(hours).padStart(2, "0");
            const m = String(minutes).padStart(2, "0");
            const s = String(seconds).padStart(2, "0");

            return `${h}:${m}:${s}`; 
    }

    function startCountdown() {
            if (intervalId !== null) return;

            const countdownEl = document.getElementById("countdown");
            countdownEl.textContent = formatTime(remainingSeconds);

            intervalId = setInterval(() => {
                remainingSeconds--;

                if (remainingSeconds <= 0) {
                    clearInterval(intervalId);
                    intervalId = null;
                    countdownEl.textContent = "Exam Finished";
                    return;
                }

                countdownEl.textContent = formatTime(remainingSeconds);
            }, 1000);
    }

window.startCountdown = startCountdown;
