// Load and process the CSV file
async function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;
        const rows = csvData.split("\n").map(row => row.split(","));

        // Store parsed CSV data
        chrome.storage.local.set({ sheetData: rows }, function () {
            document.getElementById('status').innerText = "File processed successfully!";
        });
    };
    reader.readAsText(file, "ISO-8859-1");
}

// Autofill the form fields on the webpage
function fillForm() {
    chrome.storage.local.get("sheetData", function (data) {
        const rows = data.sheetData;
        if (!rows || rows.length < 2) return;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: autofillForms,
                args: [rows]
            });
        });
    });
}

// Function to find and fill input fields
function autofillForms(rows) {
    rows.slice(1).forEach(row => {
        const studentID = row[1].trim(); // Student ID column
        const marks = row.slice(3).map(cell => cell.trim()); // Extract marks

        for (let i = 0; i < marks.length; i++) {
            let fieldID = `ctl00_PlaceHolderMain_gvDynamicStudentsMark_ctl0${i + 2}_${i + 2}_tbMark_${i}`;
            let inputField = document.getElementById(fieldID);
            
            if (inputField) {
                inputField.value = marks[i];
            }
        }
    });
    alert("Form filled successfully!");
}

// Attach event listeners
document.getElementById("fileInput").addEventListener("change", handleFile);
document.getElementById("processFile").addEventListener("click", fillForm);
