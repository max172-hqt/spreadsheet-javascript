// Global constants
const NUMBER_OF_ROWS = 20;
const NUMBER_OF_COLUMNS = 10;

class Cell {
  constructor(value="") {
    this._value = value;
    this._evaluatedValue = value;
  }
  get value() {
    return this._value;
  }

  get evaluatedValue() {
    return this._evaluatedValue;
  }

  set value(value) {
    this._value = value;
  }

  set evaluatedValue(value) {
    this._evaluatedValue = value;
  }
}

// Global application store to keep track of the application's state
const SpreadsheetApp = (() => {
  const _spreadsheet = new Array(NUMBER_OF_ROWS)
    .fill(0)
    .map(() => new Array(NUMBER_OF_COLUMNS).fill(new Cell()));

  let _state = {
    selectedId: null,
    spreadsheet: _spreadsheet,
  }

  const Store = {
    getSelectedId() {
      return _state.selectedId;
    },

    isCellSelected() {
      return _state.selectedId !== null;
    },

    selectCell(id) {
      _state.selectedId = id;
    },

    deselectCell() {
      _state.selectedId = null;
    },

    updateCell(value) {
      if (!this.getSelectedId()) {
        return false;
      }

      const [row, col] = this._getCoordinates();
      const cell = _state.spreadsheet[row][col];
      cell.value = value;

      return true;
    },

    // _isFormula(value) {
    //   if (!isNaN(value)) {
    //     return false;
    //   }

    //   return true;
    // }

    _getCoordinates() {
      if (!_state.selectedId) {
        return [-1, -1];
      }
      const [column, row] = _state.selectedId.split('-');
      return [Number.parseInt(row) -1, column.charCodeAt(0) - 'A'.charCodeAt(0)];
    },
  };

  return Object.freeze(Store);
})();

/**
 * Draw the spreadsheet table
 *
 * @param {number} numRows: Number of rows
 * @param {number} numColumns: Number of columns
 * @returns {Element} table: Intialized table element
 */
function createSpreadsheetTable(numRows, numColumns) {
  const table = document.createElement("table");
  table.className = "spreadsheet";
  table.id = "Table";

  const label = "A";
  for (let rowId = 0; rowId < numRows + 1; rowId++) {
    const tr = document.createElement("tr");

    // Add label for eachrowId
    const td = document.createElement("td");
    if (rowId >= 1) {
      td.innerHTML = rowId;
    }
    td.classList.add("rowLabel");
    tr.appendChild(td);

    for (let colId = 0; colId < numColumns; colId++) {
      // Add label for each column
      const columnName = String.fromCharCode(label.charCodeAt(0) + colId);
      if (rowId === 0) {
        const th = document.createElement("th");
        th.innerHTML = columnName;
        th.classList.add("columnLabel");
        tr.appendChild(th);
      } else {
        const td = document.createElement("td");
        td.classList.add("cell");
        td.setAttribute("id", `${columnName}-${rowId}`);
        tr.appendChild(td);
      }
    }
    table.appendChild(tr);
  }

  // Add onclick event listener for each cell in the table
  const cells = table.querySelectorAll(".cell");
  cells.forEach((el) => {
    el.addEventListener("click", (e) => {
      handleClickCell(e);
    });
  });

  return table;
}

function createCellValueForm() {
  const inputValueForm = document.createElement("form");
  const cellValueInput = document.createElement("input");
  cellValueInput.setAttribute("id", "cellValue");
  cellValueInput.disabled = true;

  // Add onsubmit event listener to input to enter cell value
  inputValueForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = e.target.cellValue.value;
    handleUpdateCellValue(value);
  });

  // Append elements to the body
  inputValueForm.appendChild(cellValueInput);
  return inputValueForm;
}

/**
 * Handle on click cell and update cell id
 *
 * @param {Event} e
 */
function handleClickCell(e) {
  e.preventDefault();
  const id = SpreadsheetApp.getSelectedId();

  const newId = e.target.id;

  // Deselect cell that are being selected
  if (id) {
    const previousCell = document.getElementById(id);
    previousCell.style.background = "none";
  }

  // Deselect if clicking on the currently selected cell
  // Otherwise, select the cell and focus on the CellValueInput
  if (id && id === newId) {
    SpreadsheetApp.deselectCell();
  } else {
    SpreadsheetApp.selectCell(newId);
    e.target.style.background = "red";
    const cellValueInput = document.getElementById('cellValue');
    cellValueInput.disabled = !SpreadsheetApp.isCellSelected();
    cellValueInput.focus();
    cellValueInput.value = "";
  }
}

/**
 * Get selected cell and handle update the cell value
 * @param {*} value 
 */
function handleUpdateCellValue(value) {
  if (SpreadsheetApp.updateCell(value)) {
    const id = SpreadsheetApp.getSelectedId();
    const cell = document.getElementById(id);
    cell.innerHTML = value;
  } else {
    // TODO: Error for invalid formula
  }
}

/**
 * Create clear button element
 * @returns Clear button element
 */
function createClearBtn(tableEl) {
  const clearBtn = document.createElement("button");
  clearBtn.innerHTML = "Clear";
  clearBtn.style.marginRight = "1em";

  clearBtn.addEventListener("click", function () {
    for (let cell of document.getElementsByClassName("cell")) {
      if (cell.innerHTML != "") {
        cell.innerHTML = "";
      } else {
        cell.innerHTML = "";
      }
    }
  });

  return clearBtn;
}

/**
 * Initialize the application
 */
function initializeSpreadsheet() {
  // Create app container
  const app = document.getElementById("app");

  // Create container for clear button and form
  const controlGroup = document.createElement('div');
  controlGroup.style.display = 'flex';
  controlGroup.style.marginBottom = '1em';

  // Create core elements
  const table = createSpreadsheetTable(NUMBER_OF_ROWS, NUMBER_OF_COLUMNS);
  const cellValueForm = createCellValueForm();
  const clearButton = createClearBtn(table);

  // Append core elements to the app container
  controlGroup.appendChild(clearButton);
  controlGroup.appendChild(cellValueForm);
  app.appendChild(controlGroup);
  app.appendChild(table);
}

// Load the Spreadsheet application
window.onload = initializeSpreadsheet;
