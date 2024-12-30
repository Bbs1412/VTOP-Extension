function getColumnSums(table) {
    // iterate all rows and sum the values in each column separately
    // Some might be strings, so we need to check for that and skip them
    // Then, if number cols, return sum to 2 decimal places
    // else, return empty string
    // And remember, if second col is not numeric, return 'Total' text for that column
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) return; // Skip tables with no data rows

    const headerRow = rows[0];
    const dataRows = rows.slice(1);

    // Initialize totals array based on the number of columns
    const totals = Array.from(headerRow.children).map(() => 0);

    // Iterate through data rows to calculate totals
    dataRows.forEach((row) => {
        row.querySelectorAll('td').forEach((cell, index) => {
            const value = parseFloat(cell.textContent.trim());
            if (!isNaN(value)) {
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
        const rows = Array.from(parent_table.querySelectorAll('tr'));

        // Skip tables with no data rows
        if (rows.length < 2) {
            console.log('Table has no data rows:', parent_table);
            return;
        }

        // Find the 'Course Title' column index
        const headerRow = rows.find(row => row.classList.contains('tableHeader'));
        if (!headerRow) {
            console.log('Table has no header row:', parent_table);
            return;
        }

        const courseTitleIndex = Array.from(headerRow.children).findIndex(cell =>
            cell.textContent.trim() === 'Course Title'
        );
        if (logErrors) console.log('Found Course Title index:', courseTitleIndex);

        return true;


    }
    catch (error) {
        console.error('Error processing table:', error);
        return false;
    }
};



// Example: Call the function to append totals row with highlighting
processTables(updateOnPage = true, highlightRow = true, logErrors = true);


// Make separate function for this:
// Example: Call the function to remove totals rows
// processTables(updateOnPage=false);
