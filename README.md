# Javascript Final Project 

## Functionalities and Requirements
- Create spreadsheet table at run-time, can change the number of rows and columns global variables
- Numeric row labels and alphabetical column labels
- Clear button to clear all cells evaluated values and formula
- Enter value for cells through text box and update the cell's evaluated value
- Enter and validate formula "= Ax + By"
  - If the formula is invalid -> show ERROR in the cell
  - Otherwise, evaluate the expression and update the cell's evaluated value
  - Empty cells are evaluated to 0 in the formula (Ax and/or By are empty)
- When clicking on a non-empty cell
  - Show value or formula on the text box 
  - Allow to modify value or the formula
- Re-evaluate the cells whose formula has the cell that has just updated
- Highlight the cell that is being selected

## App Design
- Spreadsheet app consists of cells
- Each cell is represented by a Cell object
- Cell objects have the following properties
  - value: can be a string of numeric values or a string of formula. 
  This will be shown on the cell value text box to allow user to update / edit
  - evaluatedValue: the evaluated value, which will actually be shown on the cell
