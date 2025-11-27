
const examDurInMin = 180; // 3 hours

let remainingSeconds = examDurInMin * 60;
let intervalId = null;
let flag=false;

    /*The function formatTime formats seconds to HH:MM:SS*/
    function formatTime(totalSeconds) {
            const hours   = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const h = String(hours).padStart(2, "0");
            const m = String(minutes).padStart(2, "0");
            const s = String(seconds).padStart(2, "0");

            return `${h}:${m}:${s}`; 
    }

    /*The function startCountdown starts the exam countdown. now the beginnig time is 3 hours*/
    function startCountdown() {
            if (intervalId !== null) return;

            const countdownEl = document.getElementById("countdown");
            countdownEl.textContent = formatTime(remainingSeconds);
            const addEventBtn = document.getElementById("addEventBtn");

            intervalId = setInterval(() => {
                remainingSeconds--;

                if (remainingSeconds <= 0) {
                    clearInterval(intervalId);
                    intervalId = null;
                    countdownEl.textContent = "Exam Finished";
                    disableStartButton();
                    return;
                }

                countdownEl.textContent = formatTime(remainingSeconds);
            }, 1000);
            addEventBtn.disabled =false;
            addEventBtn.classList.remove("bg-gray-400", "cursor-not-allowed");
            addEventBtn.classList.add("bg-blue-500", "hover:bg-blue-600");
            
    }

    /*The function updateClock update live clock every second */
    function updateClock() {
            if (flag===false){
                disableStartButton();
                flag=true;
            }
            const now = new Date();
            let hours = String(now.getHours()).padStart(2, '0');
            let minutes = String(now.getMinutes()).padStart(2, '0');
            let seconds = String(now.getSeconds()).padStart(2, '0');

            document.getElementById("liveClock").innerText =`${hours}:${minutes}:${seconds}`;
            
    }
    
    /*The function disableStartButton make addEventBtn disabled*/
    function disableStartButton(){
        const addEventBtn = document.getElementById("addEventBtn");
        addEventBtn.disabled = true;
        addEventBtn.classList.add("bg-gray-400", "cursor-not-allowed");
        addEventBtn.classList.remove("bg-blue-500", "hover:bg-blue-600");
    }
setInterval(updateClock, 1000);
updateClock();

window.startCountdown = startCountdown;
