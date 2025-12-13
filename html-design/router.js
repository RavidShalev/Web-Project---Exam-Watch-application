document.addEventListener("DOMContentLoaded", () => {

    /* General async load function - the function gathers the html page name and loads it into the content div
     * if there is an error during loading, it displays an error message in the content div
     */
    async function loadPage(page) {
        try {
            // fetch the page
            const response = await fetch(page);
            // gather only the text content - the name of the html file
            const html = await response.text();
            // load the content into the content div
            document.getElementById("content").innerHTML = html;
        }catch (err) {
            document.getElementById("content").innerHTML =
                `<h2 style="color:red;">Error loading page.</h2>`;
            console.error(err);
        }
    }

    async function startTheExam(){
        didExamStart = true;
        //update home status text
        const statusTxt = document.getElementById("status-txt");
        if(statusTxt){
            statusTxt.textContent = "Exam has started";
            statusTxt.style.color = "green";
        }
        //start countdown clock
        if(typeof startCountdown === "function"){
            startCountdown();
        }
        //disable start exam button
        startExamBtn.disabled = true;
        startExamBtn.classList.add("bg-gray-400", "cursor-not-allowed");
        startExamBtn.classList.remove("bg-blue-500", "hover:bg-blue-600");
    }



    // load home by default
    loadPage("home.html");

    const homeBtn = document.getElementById('nav-home');
    const examClockBtn = document.getElementById('nav-exam-clock');
    const attSheetBtn = document.getElementById('nav-attSheet');
    const reportBtn = document.getElementById('nav-report');
    const proceduresBtn = document.getElementById('nav-procedures');
    const examBotBtn = document.getElementById('nav-exam-bot');
    const startExamBtn = document.getElementById('startExamBtn');
    
    let didExamStart = false; 

    homeBtn.addEventListener('click', () => {
        loadPage("home.html");
    });

    examClockBtn.addEventListener('click', () => {
        loadPage("exam-clock.html");
    });

    attSheetBtn.addEventListener('click', () => {       
        loadPage("attSheet.html");   
    });

    reportBtn.addEventListener('click', () => {
        loadPage("report.html").then(() => initReport());    
    });

    proceduresBtn.addEventListener('click', () => {
        alert('Procedures clicked!');
    });

    examBotBtn.addEventListener('click', () => {
        loadPage('exam-bot.html');
    });

    startExamBtn.addEventListener('click', () => {
        startTheExam();
    });
});
