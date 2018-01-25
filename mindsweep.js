console.log("hey, js has loaded!");

// Convert HTML elements to JS objects
let startElem = document.getElementById("start");
let gridElem = document.getElementById("grid");
let guessElem = document.getElementById("guess");

// Set up event listener to generate the grid.
startElem.addEventListener("click", generateGrid);

// Create an object that is a grid.
// It is created outside of the generateGrid function so that it can be referenced in other functions.
let gridCells = [];

function generateGrid () {
    console.log("generateGrid entered")

    // Allow for the cells to be guessed, after the cell has been generated.
    guessElem.addEventListener("click", guessCell);

    // First, get the values that were submitted by the user.
    let difficultyLevel = document.getElementById("difficulty").value;
    let gridHeight = document.getElementById("rowNum").value;
    let gridWidth = document.getElementById("colNum").value;
    console.log("Level of difficulty is " + difficultyLevel);
    console.log("gridHeight is " + gridHeight);
    console.log("gridWidth is " + gridWidth);

    // Output the user's input as text (will become an actual grid later).
    gridElem.textContent = "You chose " + difficultyLevel + " level of difficulty";

    for (let i = 0; i < gridHeight; i++) {
        gridCells[i] = [];// Create the 2nd dimension
        for (let j=0; j < gridWidth; j++) {
            // Create the 3rd dimension. 
            // First z-level contains the bombs. 
            // Second z-level contains whether the cell has been clicked or not.
            //gridCells[i][j] = [] 
            // This is randomly setting a certain percentage of values to 1 and then everything else to 0.
            // If the difficult level is 1, it will be 10% 1's, 2 will be 20% 1's, etc.
            // It maps the 100 - difficultyLevel * 10 percent to the 50% point, 
            //   so that rounding would get difficultyLevel * 10% 1's.
            // For example if difficultyLevel is 1, it would want to map .9 to .5.
            // To do this, you would multiply a random number / 9 * 5, so that .9 would map to .5.
            gridCells[i][j]=Math.round(Math.random()*5/(10-difficultyLevel));
            if(gridCells[i][j] === 1) {
                gridCells[i][j]= 'X';
            }
        }
    }

    // Populate the cells that don't have bombs (not 'X') with how many bombs they border.
    for (let i=0; i<gridHeight; i++) {
        for (let j=0; j<gridWidth; j++) {
            gridCells[i][j] = determineCellNumber(gridCells, i, j);
        }
    }
    console.log(gridCells);
    gridElem.textContent = displayGrid(gridCells);
}

function guessCell () {
    console.log("guessCell entered");

    // First, get the Row and Column values that were entered by the user.
    let rowGuess = document.getElementById("row").value - 1; // subtract 1 since grid starts at 0
    let columnGuess = document.getElementById("column").value - 1;
    console.log("Row is " + rowGuess + ", Column is " + columnGuess);

    if (gridCells[rowGuess][columnGuess]==='X') {//If they lose
        // Set a message saying that they lose
        gridElem.textContent = "You lose!";

        // You can't guess after you lose, until you re-generate.
        guessElem.removeEventListener("click", guessCell);
    } else {
        // Mark the cell as being selected.
        gridCells[rowGuess][columnGuess]='Y'
        console.log(gridCells);
        gridElem.textContent = displayGrid(gridCells);

        // Determine the number of unguessed cells left that do not have bombs.
        gridTotal = sumGrid(gridCells);
        console.log(gridTotal);

        if (gridTotal === 0) { // If they win
            // Set a message saying that they lose
        gridElem.textContent = "You win!";

        // You can't guess after you win, until you re-generate.
        guessElem.removeEventListener("click", guessCell);
        }
    }
}

function determineCellNumber (array, row, column) {
    console.log("determineCellNumber entered");

    // Look at potentially all 8 cells around the cell in question.
    // If the cell is at the edge, it will be either 5 cells.
    // Corners will be 3 cells.
    let bombCount = 0;
    let arrayWidth = array.length;
    let arrayHeight = array[0].length;
    if(array[row][column]===0) { // 0 indicates no bomb, X indicates bomb.
        if(row > 0) {
            bombCount = bombCount + isBomb(array[row-1][column]); //below
            if(column > 0) {
                bombCount = bombCount + isBomb(array[row-1][column-1]);//below left  
            } 
            if (column < arrayWidth-1) {
                bombCount = bombCount + isBomb(array[row-1][column+1]);//below right
            }
        } 
        if (row < arrayHeight - 1) {
            bombCount = bombCount + isBomb(array[row+1][column]); //above
            if (column > 0) {
                bombCount = bombCount + isBomb(array[row+1][column-1]);//above left
            } 
            if (column < arrayWidth-1) {
                bombCount = bombCount + isBomb(array[row+1][column+1]);//above right 
            }
        }
        if (column > 0) {
            bombCount = bombCount + isBomb(array[row][column-1]);//left
        } 
        if (column < arrayWidth-1) {
            bombCount = bombCount + isBomb(array[row][column+1]);//right
        }
    } else {
        bombCount = 'X';
    }
    return bombCount;
}

function isBomb (arrayValue) {
    if(arrayValue === 'X') {
        return 1;
    } else {
        return 0;
    }
}

function isNumber (arrayValue) {
    if(arrayValue === 'X' || arrayValue ==='Y') {
        return 0;
    } else {
        return 1;
    }
}

function isSelected (arrayValue) {
    if(arrayValue ==='Y') {
        return 0;
    } else {
        return 1;
    }
}

function sumGrid (array) {
    let total = 0;
    let arrayWidth = array.length;
    let arrayHeight = array[0].length;
    for (let i=0; i<arrayHeight; i++) {
        for (let j=0; j<arrayWidth; j++) {
            total = total + isNumber(array[i][j]);
        }
    } 
    return total;
}

function displayGrid (array) {
    let text = "";
    let arrayWidth = array.length;
    let arrayHeight = array[0].length;
    for (let i=0; i<arrayHeight; i++) {
        for (let j=0; j<arrayWidth; j++) {
            if (array[i][j] === 'Y') {
                text = text + "X"
            } else {
                text = text + "O"
            }
        }
        text = text + "\n";
    }
    return text; 
}
