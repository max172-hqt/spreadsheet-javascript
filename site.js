/**
 * Draw the spreadsheet table
 *
 * @param {number} numRows: Number of rows
 * @param {number} numColumns: Number of columns
 * @returns {Element} table: Intialized table element
 */
function createSpreadsheetTable(
  numRows,
  numColumns
) {
  const table = document.createElement("table");
  table.className = "spreadsheet";
  table.id = "Table";

  const label = "A";
  for (
    let rowId = 0;
    rowId < numRows + 1;
    rowId++
  ) {
    const tr = document.createElement("tr");

    // Add label for eachrowId
    const td = document.createElement("td");
    if (rowId >= 1) {
      td.innerHTML = rowId;
    }
    td.classList.add("rowLabel");
    tr.appendChild(td);

    for (
      let colId = 0;
      colId < numColumns;
      colId++
    ) {
      // Add label for each column
      const columnName = String.fromCharCode(
        label.charCodeAt(0) + colId
      );
      if (rowId === 0) {
        const th = document.createElement("th");
        th.innerHTML = columnName;
        th.classList.add("columnLabel");
        tr.appendChild(th);
      } else {
        const td = document.createElement("td");
        td.classList.add("cell");
        td.setAttribute(
          "id",
          `${columnName}-${rowId}`
        );
        tr.appendChild(td);
      }
    }
    table.appendChild(tr);
  }
  return table;
}

function createCellValueInput() {
  const cellValueInput =
    document.createElement("input");
  cellValueInput.setAttribute("id", "cellValue");
  cellValueInput.style.marginBottom = "1em";
  cellValueInput.disabled = true;
  return cellValueInput;
}

/**
 * Handle on click cell
 *
 * @param {Event} e
 * @param {boolean} selectedCell
 */
function handleClickCell(e, selectedCell) {
  e.preventDefault();
  const id = e.target.id;

  if (selectedCell.id) {
    const previousCell = document.getElementById(
      selectedCell.id
    );
    previousCell.style.background = "none";
  }

  if (
    selectedCell?.isSelected &&
    selectedCell?.id === id
  ) {
    selectedCell.isSelected = false;
  } else {
    selectedCell.id = id;
    selectedCell.isSelected = true;
    e.target.style.background = "red";
  }
}

function handleUpdateCellValue(
  selectedCell,
  value
) {
  const cell = document.getElementById(
    selectedCell.id
  );
  cell.innerHTML = value;
}

//handle the clear button
function createClearBtn() {
  const clearBtn =
    document.createElement("button");
  clearBtn.innerHTML = "Clear";
  clearBtn.style.marginRight = "1em";

  return clearBtn;
}

/**
 * Initialize the application
 */
function initializeSpreadsheet() {
  const NUMBER_OF_ROWS = 20;
  const NUMBER_OF_COLUMNS = 10;
  const app = document.getElementById("app");
  const inputValueForm =
    document.createElement("form");
  const table = createSpreadsheetTable(
    NUMBER_OF_ROWS,
    NUMBER_OF_COLUMNS
  );
  const cellValueInput = createCellValueInput();

  const clearButton = createClearBtn();

  const selectedCell = {
    isSelected: false,
  };

  // Add onclick event listener for each cell in the table
  const cells = table.querySelectorAll(".cell");
  cells.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      handleClickCell(e, selectedCell);
      cellValueInput.disabled =
        !selectedCell.isSelected;
      cellValueInput.value = "";
    });
  });

  // Add onsubmit event listener to input to enter cell value
  inputValueForm.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      const value = e.target.cellValue.value;
      // TODO: Validate the value
      handleUpdateCellValue(selectedCell, value);
    }
  );

  clearButton.addEventListener(
    "click",
    function () {
      const Table =
        document.getElementById("Table");
      for (let row of Table.rows) {
        for (let cell of document.getElementsByClassName(
          "cell"
        )) {
          if (cell.innerHTML != "") {
            cell.innerHTML = "";
          } else {
            cell.innerHTML = "";
          }
        }
      }
    }
  );

  inputValueForm.appendChild(clearButton);
  inputValueForm.appendChild(cellValueInput);
  //   app.appendChild(clearButton);
  app.appendChild(inputValueForm);
  app.appendChild(table);
}

window.onload = initializeSpreadsheet;
