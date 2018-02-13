// Initialize Firebase
var config = {
    apiKey: "AIzaSyDas9q5A0HIjvBVZIskc4sZ_doMoRCGhTI",
    authDomain: "mindsweep-3173a.firebaseapp.com",
    databaseURL: "https://mindsweep-3173a.firebaseio.com",
    projectId: "mindsweep-3173a",
    storageBucket: "",
    messagingSenderId: "185792539203"
};
firebase.initializeApp(config);

// Create global variables.
let gridCells = [];
let globalUser;

// Convert HTML elements to JS objects
let startElem = document.getElementById("start");
let messageElem = document.getElementById("message");
let gridElem = document.getElementById("grid");
let nameElem = document.getElementById("name");
let winsElem = document.getElementById("wins");

// Create instance of Firebase's GitHub Authentication provider object
let githubAuth = new firebase.auth.GithubAuthProvider();

// Use Firebase with GitHub Authentication to log in the user
firebase.auth().signInWithPopup(githubAuth).catch(function(error) {
    // Log any errors to the console
    console.log(error);
});

// When user logs in or logs out:
firebase.auth().onAuthStateChanged(function(user) {
    handleAuthStateChange(user, nameElem);
});

function handleAuthStateChange(user, nameElem) {
    globalUser = user;
    let currentUserID = user.uid;
    let currentUserName = user.displayName
    let userRef = firebase.database().ref('users/' + currentUserID);
    userRef.on("value", initializeUser);
    function initializeUser (dataSnapshot) {
        // If the user isn't in the database already, add them.
        if (!dataSnapshot.exists()) {
        userRef.set({
            name: currentUserName,
            wins: 0
        });
        }

        // Display the name on the web page.
        nameElem.value = user.displayName; 

        // Display their number of wins.
        winsElem.value = dataSnapshot.val().wins;

        // Set the number of wins to the global user variable.
        globalUser.wins = dataSnapshot.val().wins;
    }
}

// Set up event listener to generate the grid.
startElem.addEventListener("click", generateGrid);

function generateGrid () {
    // Reset the grid.
    gridCells = [];

    // Remove the HTML grid.
    var myNode = document.getElementById("grid");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    // Reset the message.
    messageElem.textContent = "";

    // Get the values that were submitted by the user.
    let difficultyLevel = document.getElementById("difficulty").value;
    let gridHeight = document.getElementById("rowNum").value;
    let gridWidth = document.getElementById("colNum").value;

    // Update the CSS Grid values.
    document.documentElement.style.setProperty('--numCols', gridWidth);
    document.documentElement.style.setProperty('--numRows', gridHeight);

    // Create a grid of the specified height and width.
    // Each grid element is a button that when clicked is a guess.
    for (let i = 0; i < gridHeight; i++) {
        gridCells[i] = [];// Create the 2nd dimension
        for (let j=0; j < gridWidth; j++) {
            // Create a grid cell that might have a bomb in it.
            createGridCell(gridCells, difficultyLevel, i, j);
        }
    }

    // Populate the cells that don't have bombs (not 'X') with how many bombs they border.
    for (let i=0; i<gridHeight; i++) {
        for (let j=0; j<gridWidth; j++) {
            gridCells[i][j] = determineCellNumber(gridCells, i, j);
        }
    }
    console.log(gridCells);
}

function createGridCell(array, difficultyLevel, row, col) {
    // This is randomly setting a certain percentage of values to 1 and then everything else to 0.
    // If the difficult level is 1, it will be 10% 1's, 2 will be 20% 1's, etc.
    // It maps the 100 - difficultyLevel * 10 percent to the 50% point, 
    //   so that rounding would get difficultyLevel * 10% 1's.
    // For example if difficultyLevel is 1, it would want to map .9 to .5.
    // To do this, you would multiply a random number / 9 * 5, so that .9 would map to .5.
    newVal =Math.round(Math.random()*5/(10-difficultyLevel));
    if(newVal === 1) {
        newVal = 'X';
    }
    array[row][col] = newVal;

    // For each element in the grid, generate a button and place it.
    let para = document.createElement("button");
    para.id = row + " " + col;
    let node = document.createTextNode("+");
    para.appendChild(node);
    let element = document.getElementById("grid");
    element.appendChild(para);

    // Create event listener for the button that was generated.
    para.addEventListener("click", guessCell);

    // Create an event listener for the right click of the button that was gernated.
    para.addEventListener("contextmenu", turnCellRed);
}

function guessCell() {

    // Get the ID of the button element that is clicked.
    let cellID = this.id;
    let cellArray = cellID.split(" "); // The ID has the form of Row Number " " Column Number.

    // First, get the Row and Column values that were entered by the user.
    let rowGuess = parseInt(cellArray[0]); // subtract 1 since grid starts at 0
    let columnGuess = parseInt(cellArray[1]);

    if (gridCells[rowGuess][columnGuess]==='X') {//If they lose
        if (countYs(gridCells) === 0) { // If it's their first turn, don't allow them to lose
            gridCells[rowGuess][columnGuess] = 'Y';
            cascadeZeros(gridCells, rowGuess, columnGuess);
        } else {
            // Set a message saying that they lose
            messageElem.textContent = "You lose!";

            // Remove event listeners.
            clearButtonListeners(gridCells);
        }
    } else {
        // Mark the cell as being selected.
        gridCells[rowGuess][columnGuess]='Y';

        // Visually display the number on the cell.
        //let cellNum = determineCellNumber(gridCells, rowGuess, columnGuess);
        //document.getElementById(cellID).innerText = cellNum;

        // If the Cell number is 0, automatically select all cells around it.
        // This also will display the number on the cell.
        cascadeZeros(gridCells, rowGuess, columnGuess);

        // Determine the number of unguessed cells left that do not have bombs.
        gridTotal = sumGrid(gridCells);

        if (gridTotal === 0) { // If they win
            // Set a message saying that they lose
            messageElem.textContent = "You win!";

            // Remove event listeners.
            clearButtonListeners(gridCells);

            // Update the number of wins in the database.
            let userWinRef = firebase.database().ref('users/' + globalUser.uid + '/wins');
            userWinRef.set(globalUser.wins + 1);
        }
    }
}

function determineCellNumber (array, row, column) {
    // Look at potentially all 8 cells around the cell in question.
    // If the cell is at the edge, it will be either 5 cells.
    // Corners will be 3 cells.
    let bombCount = 0;
    let arrayHeight = array.length;
    let arrayWidth = array[0].length;
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
    if (this.style.color === "red") {
        this.style.color = "black";
    } else {
        this.style.color = "red";
    }
    
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
    let arrayHeight = array.length;
    let arrayWidth = array[0].length;
    for (let i=0; i<arrayHeight; i++) {
        for (let j=0; j<arrayWidth; j++) {
            total = total + isNumber(array[i][j]);
        }
    } 
    return total;
}

function displayGrid (array) {
    let text = "";
    let arrayHeight = array.length;
    let arrayWidth = array[0].length;
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

function clearButtonListeners(array){
    let arrayHeight = array.length;
    let arrayWidth = array[0].length;
    for (let i=0; i<arrayHeight; i++) {
        for (let j=0; j<arrayWidth; j++) {
            let gridID = i + " " + j;
            let buttonElem = document.getElementById(gridID);
            buttonElem.removeEventListener("click", guessCell);
        }
    }
}

function cascadeZeros(array, row, column) {
    let arrayHeight = array.length;
    let arrayWidth = array[0].length;

    // Fill out the cell number.
    let cellNum = determineCellNumber(gridCells, row, column);
    let cellID = row + " " + column;
    let cellDisplay = document.getElementById(cellID).innerText;
    document.getElementById(cellID).innerText = cellNum;
    gridCells[row][column] = 'Y';
    if(cellNum===0 && cellDisplay === "+") { // 0 indicates that you should fill out the cell's neighbors, 
    // any other number means don't do anything

        if(row > 0) {
            cascadeZeros(array, row-1, column); //below
            if(column > 0) {
                cascadeZeros(array, row-1, column-1);//below left  
            } 
            if (column < arrayWidth-1) {
                cascadeZeros(array, row-1, column+1);//below right
            }
        } 
        if (row < arrayHeight - 1) {
            cascadeZeros(array, row+1, column); //above
            if (column > 0) {
                cascadeZeros(array, row+1, column-1);//above left
            } 
            if (column < arrayWidth-1) {
                cascadeZeros(array, row+1, column+1);//above right 
            }
        }
        if (column > 0) {
            cascadeZeros(array, row, column-1);//left
        } 
        if (column < arrayWidth-1) {
            cascadeZeros(array, row, column+1);//right
        }
    } 
}

function countYs (array) {
    let total = 0;
    let arrayHeight = array.length;
    let arrayWidth = array[0].length;
    for (let i=0; i<arrayHeight; i++) {
        for (let j=0; j<arrayWidth; j++) {
            if (array[i][j] === 'Y') {
                total = total + 1;
            }
        }
    } 
    return total;
}