function initReport() {

    const incidentType = document.getElementById('incident-type');
    const incidentStudent = document.getElementById('incident-student');
    const incidentNote = document.getElementById('incident-note'); 
    const submitBtn = document.getElementById('add-report-btn');
    const tableBody = document.getElementById('incident-table-body');

    // load all existing reports from localStorage
    let reports = JSON.parse(localStorage.getItem("examReports")) || [];

    // render the reports table
    tableBody.innerHTML = "";
    reports.forEach(addRow);
    
    // handle form submission
    submitBtn.addEventListener('click', () => {
        const type = incidentType.value;

        if(type === "") {
            alert("Please select an incident type.");
            return;
        }

        const student_id = incidentStudent.value.trim();

        if(student_id === "") {
            alert("Please enter a student ID.");
            return;
        }

        // note is optional
        const note = incidentNote.value.trim() !== "" ? incidentNote.value.trim() : "—";

        // get current date and time
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        // new report object
        const newReport = {
            time,
            type,
            student_id,
            note: note || "—"
        };

        // add new report to localStorage
        reports.push(newReport);
        localStorage.setItem("examReports", JSON.stringify(reports));

        // add the report in the front
        addRow(newReport);
    });

    // function to add a new line in the report table
    function addRow(report){
        tableBody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-3 py-2 border-b">${report.time}</td>
                <td class="px-3 py-2 border-b">${report.type}</td>
                <td class="px-3 py-2 border-b">${report.student_id}</td>
                <td class="px-3 py-2 border-b">${report.note}</td>
            </tr>
        `;
    }

}