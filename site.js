// Initialize the application
function initializeTable() {
    const NUMBER_OF_ROWS = 10;
    const NUMBER_OF_COLUMNS = 10;
    const app = document.getElementById('app');
    const table = createSpreadsheetTable(app, NUMBER_OF_ROWS, NUMBER_OF_COLUMNS)
    app.appendChild(table);
}

// Draw the spreadsheet table
function createSpreadsheetTable(parentEl, numRows, numColumns) {
    const table = document.createElement('table');

    // Create the header
    let rowEl;
    let columnEl;

    const label = 'A';
    for (let row = 0; row < numRows + 1; row++) {
        rowEl = document.createElement('tr')

        // Add label for each row
        const rowLabel = document.createElement('td');
        if (row >= 1) {
            rowLabel.innerHTML = row;
        }
        rowEl.appendChild(rowLabel);

        for (let col = 0; col < numColumns; col++) {
            columnEl = document.createElement('th');

            // Add label for each column
            if (row === 0) {
                columnEl.innerHTML = String.fromCharCode(label.charCodeAt(0) + col)
            }
            rowEl.appendChild(columnEl);
        }
        table.appendChild(rowEl);
    }
    return table;
}

window.onload = initializeTable;
