const startBtn = document.getElementById("start-btn");
const notStartedTxt = document.getElementById("status-txt");

if (startBtn && notStartedTxt) {
    startBtn.addEventListener("click", () => {
        notStartedTxt.textContent = "Exam has started";
        notStartedTxt.style.color = "green";
        startBtn.disabled = true;
        startBtn.classList.add("bg-gray-400", "cursor-not-allowed");
        startBtn.classList.remove("bg-[#93c5fd]", "hover:bg-[#1e3a8a]");
    });
}