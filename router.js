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
            if (page==="home.html"){
                const script = document.createElement("script");
                script.src = "home.js";
                document.body.appendChild(script);
            } 
        }catch (err) {
            document.getElementById("content").innerHTML =
                `<h2 style="color:red;">Error loading page.</h2>`;
            console.error(err);
        }
    }

    // load home by default
    loadPage("home.html");

    const homeBtn = document.getElementById('nav-home');
    const examClockBtn = document.getElementById('nav-exam-clock');
    const attSheetBtn = document.getElementById('nav-attSheet');
    const reportBtn = document.getElementById('nav-report');
    const proceduresBtn = document.getElementById('nav-procedures');
    const examBotBtn = document.getElementById('nav-exam-bot');

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
        alert('Report clicked!');
    });

    proceduresBtn.addEventListener('click', () => {
        alert('Procedures clicked!');
    });

    examBotBtn.addEventListener('click', () => {
        alert('Exam Bot clicked!');
    });
});
