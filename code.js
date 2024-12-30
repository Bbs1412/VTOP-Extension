(function () {
    // Select all tables with the class 'customTable' and 'customTable-level1'
    const tables = document.querySelectorAll('table.customTable, table.customTable-level1');

    tables.forEach((table) => {
        try {
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

            // Create a new row for totals
            const totalRow = document.createElement('tr');
            totalRow.style.backgroundColor = '#f0f0f0'; // Optional: style the row

            totals.forEach((total, index) => {
                const cell = document.createElement('td');
                cell.textContent = total ? total.toFixed(2) : ''; // Add totals or leave blank for text columns
                totalRow.appendChild(cell);
            });

            // Append the totals row to the table
            table.appendChild(totalRow);

            return true;
        } catch (error) {
            console.error('Error processing table:', table, error);
            return false;
        }
    });
})();
