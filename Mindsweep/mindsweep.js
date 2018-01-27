console.log("hey, js has loaded!");

// Convert HTML elements to JS objects
let startElem = document.getElementById("start");
let messageElem = document.getElementById("message");
let gridElem = document.getElementById("grid");

// Set up event listener to generate the grid.
startElem.addEventListener("click", generateGrid);

function test () {
    console.log("test" + this.id);
}

// Create an object that is a grid.
// It is created outside of the generateGrid function so that it can be referenced in other functions.
let gridCells = [];

function generateGrid () {
    console.log("generateGrid entered")

    // First, get the values that were submitted by the user.
    let difficultyLevel = document.getElementById("difficulty").value;
    let gridHeight = document.getElementById("rowNum").value;
    let gridWidth = document.getElementById("colNum").value;
    console.log("Level of difficulty is " + difficultyLevel);
    console.log("gridHeight is " + gridHeight);
    console.log("gridWidth is " + gridWidth);

    // Output the user's input as text (will become an actual grid later).
    messageElem.textContent = "You chose " + difficultyLevel + " level of difficulty";

    for (let i = 0; i < gridHeight; i++) {
        gridCells[i] = [];// Create the 2nd dimension
        for (let j=0; j < gridWidth; j++) {
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

            // For each element in the grid, generate a button and place it.
            let para = document.createElement("button");
            para.id = i + " " + j;
            let node = document.createTextNode("+");
            para.appendChild(node);
            let element = document.getElementById("grid");
            element.appendChild(para);

            // Create event listener for the button that was generated.
            para.addEventListener("click", guessCell);

            // Create an event listener for the right click of the button that was gernated.
            para.addEventListener("contextmenu", turnCellRed);
        }
        // After each row, create a paragraph so that it will go to the next row.
        let para = document.createElement("p");
        let node = document.createTextNode("");
        para.appendChild(node);
        let element = document.getElementById("grid");
        element.appendChild(para);

    }

    // Populate the cells that don't have bombs (not 'X') with how many bombs they border.
    for (let i=0; i<gridHeight; i++) {
        for (let j=0; j<gridWidth; j++) {
            gridCells[i][j] = determineCellNumber(gridCells, i, j);
        }
    }
    console.log(gridCells);
}

function guessCell () {
    console.log("guessCell entered");

    // Get the ID of the button element that is clicked.
    let cellID = this.id;
    let cellArray = cellID.split(" "); // The ID has the form of Row Number " " Column Number.

    // First, get the Row and Column values that were entered by the user.
    let rowGuess = parseInt(cellArray[0]); // subtract 1 since grid starts at 0
    let columnGuess = parseInt(cellArray[1]);
    console.log("Row is " + rowGuess + ", Column is " + columnGuess);

    if (gridCells[rowGuess][columnGuess]==='X') {//If they lose
        // Set a message saying that they lose
        messageElem.textContent = "You lose!";
    } else {
        // Mark the cell as being selected.
        gridCells[rowGuess][columnGuess]='Y';
        console.log(gridCells);

        // Visually display the number on the cell.
        let cellNum = determineCellNumber(gridCells, rowGuess, columnGuess);
        document.getElementById(cellID).innerText = cellNum;

        // Determine the number of unguessed cells left that do not have bombs.
        gridTotal = sumGrid(gridCells);
        console.log(gridTotal);

        if (gridTotal === 0) { // If they win
            // Set a message saying that they lose
        messageElem.textContent = "You win!";
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
    if(array[row][column]!=="X") { // 0 indicates no bomb, X indicates bomb.
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

function turnCellRed (event) {
    this.style.color = "red";

    // Prevent right-clicking from opening up the menu.
    event.preventDefault();
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
            if (array[i][j] === 'Y') {// already guessed
                text = text + determineCellNumber(array, i, j);
            } else {
                text = text + "O" // hasn't been guessed
            }
        }
        text = text + "\n";
    }
    return text; 
}
