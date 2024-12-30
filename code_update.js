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

    return totals;
}



function processTables(updateOnPage = true, highlightRow = false, logErrors = true) {
    // Pick the parent table:
    const parent_table = document.querySelector('table.customTable');
    if (logErrors) console.log('Found parent table');

    try {
        // Get only the direct child rows of the parent table
        const rows = Array.from(parent_table.tBodies[0]?.children || []);

        // Skip tables with no data rows
        if (rows.length < 2) {
            console.log('Table has no data rows:', parent_table);
            return;
        }

        // Find the header row of the parent table (which is 0th row actually):
        const headerRow = rows.find(row => row.classList.contains('tableHeader'));
        if (!headerRow) {
            console.log('Table has no header row:', parent_table);
            return;
        }

        // Find the 'Course Title' column index
        const courseTitleIndex = Array.from(headerRow.children).findIndex(cell =>
            cell.textContent.trim() === 'Course Title'
        );
        if (logErrors) console.log('Found Course Title index:', courseTitleIndex);

        // Iterate through data rows to get subjects and marks in alternate rows:
        currentRow = 1;
        subjectCount = 0;

        while (currentRow < rows.length) {
            let row = rows[currentRow];
            let cells = row.querySelectorAll('td');
            const courseTitle = cells[courseTitleIndex].textContent.trim();
            subjectCount++;
            if (logErrors) console.log('[', subjectCount, '] Found Course Title:', courseTitle);

            row = rows[++currentRow];

            // Now this row has only one td which hold the table in it, get that table pass to fn
            const table = row.querySelector('table');
            if (!table) {
                console.log('No table found in row:', row);
                currentRow++;
                continue;
            }

            // Get the totals (array) for the table
            const totals = getColumnSums(table);
            if (logErrors) console.log('Totals:', totals);

            currentRow += 1;
        }

        return true;
    }
    catch (error) {
        console.error('Error processing table:', error);
        return false;
    }
};



// Example: Call the function to append totals row with highlighting
// processTables(updateOnPage = true, highlightRow = true, logErrors = true);
processTables(updateOnPage = false, highlightRow = false, logErrors = true);


// Make separate function for this:
// Example: Call the function to remove totals rows
// processTables(updateOnPage=false);
