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


function removeTotalsRows(logErrors = true) {
    // Select all rows with ID 'bbs_custom'
    const existingTotalsRows = document.querySelectorAll('tr#bbs_custom');
    if (logErrors) console.log('[BBS Extension] Removing totals rows');

    if (existingTotalsRows.length > 0) {
        if (logErrors) console.log(` |-> Found ${existingTotalsRows.length} totals row(s) to remove`);

        // Iterate over the NodeList and remove each row
        existingTotalsRows.forEach(row => row.remove());

        if (logErrors) console.log(` |-> Removed all totals rows with ID #bbs_custom`);
    } else {
        if (logErrors) console.log(` |-> No totals rows found to remove`);
    }
}


function processTables(updateOnPage = true, highlightRow = false, logErrors = true) {
    // Pick the parent table:
    const parent_table = document.querySelector('table.customTable');
    if (logErrors) console.log('[BBS Extension] Adding totals rows:');
    if (logErrors) console.log(' |-> Found parent table');

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
        if (logErrors) console.log(' |-> Found Course Title index:', courseTitleIndex);

        // Iterate through data rows to get subjects and marks in alternate rows:
        currentRow = 1;
        subjectCount = 0;

        while (currentRow < rows.length) {
            let row = rows[currentRow];
            let cells = row.querySelectorAll('td');
            const courseTitle = cells[courseTitleIndex].textContent.trim();
            subjectCount++;
            if (logErrors) console.log(` |-> [${subjectCount}] Found Course:`);
            if (logErrors) console.log(` |-> Course Title: ${courseTitle}`);

            row = rows[++currentRow];

            // Now this row has only one td which hold the table in it, get that table pass to fn
            const table = row.querySelector('table');
            if (!table) {
                console.log(' |-> No table found in row:', row);
                currentRow++;
                continue;
            }

            // Get the totals (array) for the table
            const totals = getColumnSums(table);
            if (logErrors) console.log(` |-> Calculated totals:`, totals);

            // Show the totals on page in new row with id #bbs_custom:
            if (updateOnPage) {
                // Check if the totals row already exists
                const existingTotalsRow = table.querySelector('tr#bbs_custom');

                if (!existingTotalsRow) {
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

                    if (logErrors) console.log(` |-> Appended totals row to table with ID #bbs_custom`);

                } else {
                    if (logErrors) console.log(` |-> Totals rows already exists`);
                }
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




// Example: Call the function to append totals row with highlighting
// Testing:
// processTables(updateOnPage = true, highlightRow = false, logErrors = true);

// Development:
// processTables(updateOnPage = true, highlightRow = true, logErrors = true);

// Production:
// processTables(updateOnPage = true, highlightRow = true, logErrors = false);

// Un-comment this to test via console:
// window.addEventListener('DOMContentLoaded', () => {
//     processTables(updateOnPage = true, highlightRow = true, logErrors = true);
// });

