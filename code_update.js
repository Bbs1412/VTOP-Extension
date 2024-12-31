// -------------------------------------------------------------------------
// The main part of script for all the functionality of the extension
// Description: This script is used to update the table with
// totals row for each subject.
// -------------------------------------------------------------------------


function getColumnSums(table) {
    // iterate all rows and sum the values in each column separately
    // Some might be strings, so we need to check for that and skip them
    // Then, if number cols, return sum to 2 decimal places
    // else, return empty string
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) return; // Skip tables with no data rows

    // Initialize totals array based on the number of columns
    const totals = Array.from(rows[0].children).map(() => 0);

    // Iterate through data rows to calculate totals
    rows.slice(1).forEach((row) => {
        // Iterate through cells in the row and keep updating totals:
        row.querySelectorAll('td').forEach((cell, index) => {
            const value = parseFloat(cell.textContent.trim());

            // Skip the SrNo column
            if (index === 0) {
                totals[index] = '-';
            }
            // Title column
            else if (index === 1) {
                totals[index] = 'Total';
            }
            else if (!isNaN(value)) {
                totals[index] += value;
            }
        });
    });

    for (let i = 0; i < totals.length; i++) {
        if (totals[i] === 0) {
            totals[i] = '-';
        }

        if (typeof totals[i] === 'number') {
            totals[i] = totals[i].toFixed(2);
        }
    }
    return totals;
}


function removeTotalsRows(logDetails = true) {
    // Select all rows with ID 'bbs_custom'
    const existingTotalsRows = document.querySelectorAll('tr#bbs_custom');
    if (logDetails) console.log('[BBS Extension] Removing totals rows');

    if (existingTotalsRows.length > 0) {
        if (logDetails) console.log(` |-> Found ${existingTotalsRows.length} totals row(s) to remove`);

        // Iterate over the NodeList and remove each row
        existingTotalsRows.forEach(row => row.remove());

        if (logDetails) console.log(` |-> Removed all totals rows with ID #bbs_custom`);
    } else {
        if (logDetails) console.log(` |-> No totals rows found to remove`);
    }
}


function processTables(updateOnPage = true, highlightRow = false, logDetails = true) {
    // Pick the parent table:
    const parent_table = document.querySelector('table.customTable');
    if (logDetails) console.log('[BBS Extension] Adding totals rows:');
    if (logDetails) console.log(' |-> Found parent table');

    try {
        // Get only the direct child rows of the parent table
        const rows = Array.from(parent_table.tBodies[0]?.children || []);

        // Skip tables with no data rows
        if (rows.length < 2) {
            console.log(' |-> Table has no data rows:', parent_table);
            return;
        }

        // Find the header row of the parent table (which is 0th row actually):
        const headerRow = rows.find(row => row.classList.contains('tableHeader'));
        if (!headerRow) {
            console.log(' |-> Table has no header row:', parent_table);
            return;
        }

        // Find the 'Course Title' column index
        const courseTitleIndex = Array.from(headerRow.children).findIndex(cell =>
            cell.textContent.trim() === 'Course Title'
        );
        if (logDetails) console.log(' |-> Found Course Title index:', courseTitleIndex);

        // Iterate through data rows to get subjects and marks in alternate rows:
        currentRow = 1;
        subjectCount = 0;

        // Check if the totals row already exists, and remove it if it does
        const existingTotalsRows = document.querySelectorAll('tr#bbs_custom');
        if (existingTotalsRows.length > 0) {
            if (logDetails) console.log(` |-> Totals row already exists, removing it...`);
            if (logDetails) console.log(` |-> Found ${existingTotalsRows.length} totals row(s) to remove`);
            // Iterate over the NodeList and remove each row
            existingTotalsRows.forEach(row => row.remove());
            if (logDetails) console.log(` |-> Removed all totals rows with ID #bbs_custom`);
        }

        while (currentRow < rows.length) {
            let row = rows[currentRow];
            let cells = row.querySelectorAll('td');
            const courseTitle = cells[courseTitleIndex].textContent.trim();
            subjectCount++;
            if (logDetails) console.log(` |-> [${subjectCount}] Found Course:`);
            // if (logDetails) console.log(` |    |-> Course Title: '${courseTitle}'`);
            if (logDetails) {
                const highlightColor = '\x1b[33m';
                const resetColor = '\x1b[0m';
                console.log(` |    |-> Course Title: ${highlightColor}'${courseTitle}'${resetColor}`);
            }

            row = rows[++currentRow];

            // Now this row has only one td which hold the table in it, get that table pass to fn
            const table = row.querySelector('table');
            if (!table) {
                console.log(' |    |-> No table found in row:', row);
                currentRow++;
                continue;
            }

            // Get the totals (array) for the table
            const totals = getColumnSums(table);
            if (logDetails) console.log(` |    |-> Calculated totals:`, totals);

            // Show the totals on page in new row with id #bbs_custom:
            if (updateOnPage) {
                // Create a new row for totals
                const totalsRow = document.createElement('tr');
                // assign the class "tableContent-level1" to the row 
                totalsRow.className = 'tableContent-level1';
                // Assign the unique ID "bbs_custom" to the row
                totalsRow.id = 'bbs_custom';
                // // align center for all cells:
                // totalsRow.style.textAlign = 'center';

                totals.forEach((total, index) => {
                    const cell = document.createElement('td');
                    // Set cell content based on the column type
                    if (typeof total === 'string') {
                        // For "Total" label in the second column
                        cell.textContent = total;
                    } else if (total !== 0) {
                        // Format numbers to 2 decimal places
                        cell.textContent = total.toFixed(2);
                    } else {
                        // Leave blank for non-numeric columns
                        cell.textContent = '-';
                    }
                    totalsRow.appendChild(cell);
                });

                // Optional: Add custom styling for the totals row
                if (highlightRow) {
                    totalsRow.style.backgroundColor = '#f0f0f0';
                    totalsRow.style.fontWeight = 'bold';
                    totalsRow.style.border = '1px solid black';
                    // show the border between cells:
                    totalsRow.style.borderCollapse = 'collapse';
                }

                // Append the totals row to the table > tbody > 
                table.tBodies[0].appendChild(totalsRow);

                if (logDetails) console.log(` |    |-> Appended totals row to table with ID #bbs_custom`);

            }

            currentRow += 1;
        }

        return true;
    }
    catch (error) {
        console.error(' |-> Error processing table:', error);
        return false;
    }
};


// -------------------------------------------------------------------------
// test function
// -------------------------------------------------------------------------

function testFunction() {
    console.log("[BBS Extension] Test function called");
    window.alert('[BBS Extension] Test function active');
    return true;
}


// -------------------------------------------------------------------------
// Sample calls:
// -------------------------------------------------------------------------

// Testing:
// processTables(updateOnPage = true, highlightRow = false, logDetails = true);

// Development:
// processTables(updateOnPage = true, highlightRow = true, logDetails = true);

// Production:
// processTables(updateOnPage = true, highlightRow = true, logDetails = false);

// Un-comment this to test via console:
// window.addEventListener('DOMContentLoaded', () => {
//     processTables(updateOnPage = true, highlightRow = true, logDetails = true);
// });


// -------------------------------------------------------------------------
// Event listeners for the popup buttons:
// Description: This file contains the code for the popup window that appears when the extension icon is clicked.
// -------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const enableLogging = document.getElementById("enableLogging");
    const highlightTotals = document.getElementById("highlightTotals");
    const alertBeforeOps = document.getElementById("alertBeforeOps");
    const updateOnPage = document.getElementById("updateOnPage");
    const saveCustomizationsButton = document.getElementById("saveCustomizations");

    // Load saved preferences when popup opens
    chrome.storage.local.get(["customizations"], (result) => {
        const customizations = result.customizations || {};
        enableLogging.checked = customizations.enableLogging !== undefined ? customizations.enableLogging : true;
        highlightTotals.checked = customizations.highlightTotals !== undefined ? customizations.highlightTotals : true;
        alertBeforeOps.checked = customizations.alertBeforeOps !== undefined ? customizations.alertBeforeOps : true;
        updateOnPage.checked = customizations.updateOnPage !== undefined ? customizations.updateOnPage : true;
    });

    // Save preferences when "Save Customizations" button is clicked
    saveCustomizationsButton.addEventListener("click", () => {
        const customizations = {
            enableLogging: enableLogging.checked,
            highlightTotals: highlightTotals.checked,
            alertBeforeOps: alertBeforeOps.checked,
            updateOnPage: updateOnPage.checked
        };

        chrome.storage.local.set({ customizations }, () => {
            alert("Customizations saved!");
            console.log("[BBS Extension] Customizations saved:", customizations);
        });
    });
});



document.getElementById('addTotals').addEventListener('click', () => {
    chrome.storage.local.get(["customizations"], (result) => {
        const customizations = result.customizations || {};

        if (customizations.enableLogging) {
            console.log("[BBS Extension] addTotals button clicked");
        }

        if (customizations.alertBeforeOps) {
            if (!confirm("Are you sure you want to add totals row?")) {
                return;
            }
        }


        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;

            chrome.scripting.executeScript({
                target: { tabId: tabId },

                // Pass customizations values explicitly via args
                func: (updateOnPage, highlightRow, logDetails) => {
                    processTables(updateOnPage, highlightRow, logDetails);
                },
                args: [
                    customizations.updateOnPage || false,
                    customizations.highlightTotals || false,
                    customizations.enableLogging || false
                ]
            });
        });
    });
});


document.getElementById('removeTotals').addEventListener('click', () => {
    chrome.storage.local.get(["customizations"], (result) => {
        const customizations = result.customizations || {};

        if (customizations.enableLogging) {
            console.log("[BBS Extension] removeTotals button clicked");
        }

        if (customizations.alertBeforeOps) {
            if (!confirm("Are you sure you want to remove totals row?")) {
                return;
            }
        }

        // Query the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // Get the tabId of the active tab
            const tabId = tabs[0].id;

            chrome.scripting.executeScript({
                // Specify the tabId
                target: { tabId: tabId },

                // Pass customizations values explicitly via args
                func: (logDetails) => {
                    removeTotalsRows(logDetails);
                },
                args: [
                    customizations.enableLogging || true
                ]
            });
        });
    });
});


document.getElementById('test').addEventListener('click', () => {
    console.log("Test button clicked");
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Get the tabId of the active tab
        const tabId = tabs[0].id;

        chrome.scripting.executeScript({
            // Specify the tabId
            target: { tabId: tabId },
            // Call the removeTotalsRows function
            func: () => testFunction(),
        });
    });
}
);

