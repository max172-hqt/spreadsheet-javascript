// Global constants
const NUMBER_OF_ROWS = 10;
const NUMBER_OF_COLUMNS = 10;

// ================== APPLICATION LOGIC ==================
/**
 * Class to represent a Cell in the Spreadsheet App
 * 
 * value: The expression, could be numeric value or formula 
 * evaluatedValue: The evaluated and displayed value in the cell
 */
class Cell {
  constructor(value = "") {
    this._value = value;
    this._evaluatedValue = value;
  }
  // Getters and setters
  get value() {
    return this._value;
  }

  get evaluatedValue() {
    if (this._evaluatedValue.length === 0) {
      return "";
    }

    if (!isNaN(this._evaluatedValue)) {
      return Number.parseInt(this._evaluatedValue);
    }

    return this._evaluatedValue;
  }

  set value(value) {
    this._value = value.toUpperCase();
  }

  set evaluatedValue(value) {
    this._evaluatedValue = value;
  }
}

/**
 * Global application store to keep track of the application's state
 */
const SpreadsheetApp = (() => {
  const _spreadsheet = new Array(NUMBER_OF_ROWS)
    .fill(0)
    .map(() => new Array(NUMBER_OF_COLUMNS).fill(0).map(() => new Cell()));

  let state = {
    selectedId: null,
    spreadsheet: _spreadsheet,
  };

  const Store = {
    /**
     * Get current selected cell id
     */
    getSelectedId() {
      return state.selectedId;
    },

    /**
     * Get cell object in the spreadsheet
     * 
     * @param {int} id: id string (A1, A2, ...)
     * @returns cell object in the spreadsheet
     */
    getCell(id) {
      const [row, col] = this._getCoordinates(id);
      return state.spreadsheet[row][col];
    },

    /**
     * Get current selected cell object
     * @returns cell object
     */
    getSelectedCell() {
      if (!this.isCellSelected()) {
        return null;
      }
      return this.getCell(state.selectedId);
    },

    /**
     * Check if a cell is currently selected
     * @returns boolean
     */
    isCellSelected() {
      return state.selectedId !== null;
    },

    /**
     * Select a cell
     * @param {*} id 
     */
    selectCell(id) {
      state.selectedId = id;
    },

    /**
     * Deselect cell
     */
    deselectCell() {
      state.selectedId = null;
    },

    /**
     * Clear all cells in the spreadsheet
     */
    clearAllCells() {
      // Clear cell data
      for (let i = 0; i < NUMBER_OF_ROWS; i++) {
        for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
          state.spreadsheet[i][j] = new Cell();
        }
      }

      state.selectedId = null;
    },

    /**
     * Update and re-evaluate cell value
     * 
     * If numeric value, evaluated value is simply value
     * Otherwise, evaluate the formula and update the evaluated value
     * 
     * Then, Update all cells that depend on this cell
     * For example,
     * A1 = 1, A2 = 2
     * A3 = A1 + A2
     * If we update A1, then A3 also needs to be updated
     * 
     * A4 = any + A3
     * If we update A1, then A3, A4 also needs to be updated
     * 
     * @param {String} value input from user, numeric or formula
     * @returns list of cell ids that need to be updated
     */
    updateCell(value) {
      const cell = this.getSelectedCell();
      value = value.replaceAll(' ', '');
      cell.value = value;

      if (this._isFormula(value)) {
        const result = this._evaluateFormula(this.getSelectedId());
        cell.evaluatedValue = result;
        // Return if the cell evaluated value is ERROR
        if (cell.evaluatedValue === 'ERROR') {
          return [this.getSelectedId()];
        }
      } else {
        cell.evaluatedValue = value;
      }

      // Update value of all related cells
      const updatedCellIds = this._getDependencyCells(this.getSelectedId());
      updatedCellIds.forEach(id => {
        const currCell = this.getCell(id);
        const result = this._evaluateFormula(id);
        currCell.evaluatedValue = result;
      });

      updatedCellIds.push(this.getSelectedId());
      return updatedCellIds;
    },

    /**
     * Get list of cells that depend on this cell, recursively
     * 
     * @param {String} id 
     * @returns List of cells
     */
    _getDependencyCells(id) {
      const dependencyList = [];
      const helper = (id) => {
        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
          for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
            const currCell = state.spreadsheet[i][j];
            const currId = this._getId(i, j);

            if (currCell.value.includes(id)) {
              dependencyList.push(currId);
              helper(currId); 
            }
          }
        }
      }
      helper(id);
      return dependencyList;
    },

    /**
     * Check if the expression is formula
     * 
     * @param {String} expression
     * @returns 
     */
    _isFormula(expression) {
      return isNaN(expression) && expression.startsWith("=");
    },

    /**
     * Return the coordinates of the cell in spreadsheet
     * 
     * @param {String} id 
     * @returns 
     */
    _getCoordinates(id) {
      if (!id) return null;
      const row = id.slice(1);
      const column = id[0];
      return [
        Number.parseInt(row) - 1,
        column.charCodeAt(0) - "A".charCodeAt(0),
      ];
    },

    /**
     * Return the id string from x, y coordiante
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @returns id
     */
    _getId(x, y) {
      if (x < 0 || x >= NUMBER_OF_ROWS || y < 0 || y >= NUMBER_OF_COLUMNS) {
        throw new Error("Invalid x and y");
      }
      
      return `${String.fromCharCode('A'.charCodeAt(0) + y)}${x+1}`;
    },

    /**
     * Evaluate the formula in the cell
     * 
     * @param {String} id 
     * @returns Evaulated value
     */
    _evaluateFormula(id) {
      const cell = this.getCell(id);
      const expression = cell.value.slice(1); // discard '=' symbol
      const ops = expression.split("+");

      // If the formula not in the form of Ax + By
      // or contain circular reference, 
      // the evaluate value should be invalid
      if (ops.length != 2 || ops.includes(id)) {
        return "ERROR";
      }

      // Get values of 2 cells in the expression
      const val1 = this.getCell(ops[0]).evaluatedValue || 0;
      const val2 = this.getCell(ops[1]).evaluatedValue || 0;
      return val1 + val2;
    },
  };

  return Object.freeze(Store);
})();
// ================== END APPLICATION LOGIC ==================

// ==================       UI LOGIC        ==================
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

    // Add label for each row on the first column (1,2,3...)
    const td = document.createElement("td");
    if (rowId >= 1) {
      td.innerHTML = rowId;
    }
    td.classList.add("rowLabel");
    tr.appendChild(td);

    for (let colId = 0; colId < numColumns; colId++) {
      const columnName = String.fromCharCode(label.charCodeAt(0) + colId);
      if (rowId === 0) {
        // Add label for each column on the first row (A, B, C ...)
        const th = document.createElement("th");
        th.innerHTML = columnName;
        th.classList.add("columnLabel");
        tr.appendChild(th);
      } else {
        // Create normal cell
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

  // Append input el to the form
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
    e.target.style.background = "orange";
    const cellValueInput = document.getElementById("cellValue");
    cellValueInput.disabled = false;
    cellValueInput.focus();

    SpreadsheetApp.selectCell(newId);
    cellValueInput.value = SpreadsheetApp.getSelectedCell().value;
  }
}

/**
 * Get selected cell and handle update the cell value
 * @param {*} value
 */
function handleUpdateCellValue(value) {
  const updatedCellIds = SpreadsheetApp.updateCell(value);

  updatedCellIds.forEach(id => {
    const cell = document.getElementById(id);
    cell.innerHTML = SpreadsheetApp.getCell(id).evaluatedValue;
  })
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
      cell.style.background = "none";
    }
    const valueForm = document.getElementById('cellValue');
    valueForm.value = '';
    valueForm.disabled = true;
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
  const controlGroup = document.createElement("div");
  controlGroup.style.display = "flex";
  controlGroup.style.marginBottom = "1em";

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
