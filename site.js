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
    return Number.parseInt(this._evaluatedValue);
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
    .map(() => new Array(NUMBER_OF_COLUMNS).fill(0).map(() => new Cell()));

  let state = {
    selectedId: null,
    spreadsheet: _spreadsheet,
  }

  const Store = {
    getSelectedId() {
      return state.selectedId;
    },

    getCell(id) {
      const [row, col] = this._getCoordinates(id);
      return state.spreadsheet[row][col];
    },

    getSelectedCell() {
      if (!this.isCellSelected()) {
        return null;
      }
      return this.getCell(state.selectedId)
    },

    isCellSelected() {
      return state.selectedId !== null;
    },

    selectCell(id) {
      state.selectedId = id;
    },

    deselectCell() {
      state.selectedId = null;
    },

    clearAllCells() {
      // Clear cell data
      for (let i = 0; i < NUMBER_OF_ROWS; i++) {
        for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
          state.spreadsheet[i][j] = new Cell();
        }
      }

      state.selectedId = null;
    },

    updateCell(value) {
      if (!this.getSelectedId()) {
        return false;
      }

      const cell = this.getSelectedCell();
      cell.value = value;

      if (this._isFormula(value)) {
        const result = this._evaluateFormula(value);
        cell.evaluatedValue = result;
      } else {
        cell.evaluatedValue = value;
      }

      return true;
    },

    _isFormula(value) {
      return isNaN(value) && value.startsWith('=');
    },

    _getCoordinates(id) {
      if (!id) return null;
      const row = id.slice(1);
      const column = id[0];
      return [Number.parseInt(row) - 1, column.charCodeAt(0) - 'A'.charCodeAt(0)];
    },

    _evaluateFormula(value) {
      const expression = value.slice(1); // discard = symbol
      const ops = expression.split('+');
      if (ops.length != 2) {
        return 'ERROR';
      }
      const [cellId1, cellId2] = ops;
      const val1 = this.getCell(cellId1).evaluatedValue ?? 0;
      const val2 = this.getCell(cellId2).evaluatedValue ?? 0;
      return val1 + val2;
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
        td.setAttribute("id", `${columnName}${rowId}`);
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

/**
 * @returns Input element to update cell value
 */
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
    e.target.style.background = "orange";
    const cellValueInput = document.getElementById('cellValue');
    cellValueInput.disabled = false;
    cellValueInput.focus();
    cellValueInput.value = SpreadsheetApp.getCell(newId).value;
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
    cell.innerHTML = SpreadsheetApp.getSelectedCell().evaluatedValue;
  } else {
    // TODO: Error for invalid formula
  }
}

/**
 * Create clear button element
 * @returns Clear button element
 */
function createClearBtn() {
  const clearBtn = document.createElement("button");
  clearBtn.innerHTML = "Clear";
  clearBtn.style.marginRight = "1em";

  clearBtn.addEventListener("click", function () {
    SpreadsheetApp.clearAllCells();
    for (let cell of document.getElementsByClassName("cell")) {
      cell.innerHTML = "";
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
  const clearButton = createClearBtn();

  // Append core elements to the app container
  controlGroup.appendChild(clearButton);
  controlGroup.appendChild(cellValueForm);
  app.appendChild(controlGroup);
  app.appendChild(table);
}

// Load the Spreadsheet application
window.onload = initializeSpreadsheet;
