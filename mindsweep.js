console.log("hey, js has loaded!");

// Variables
let gridLen = 10;
let gridWidth = 10;

// Convert HTML elements to JS objects
let startElem = document.getElementById("start");
let gridElem = document.getElementById("grid");

// Set up event listener
startElem.addEventListener("click", generateGrid);

function generateGrid () {
    console.log("generateGrid entered")

    // First, get the value that was submitted by the user
    let numBombs = document.getElementById("bombs").value;
    console.log("number of bombs is " + numBombs)

    // Output the user's input as text (will become an actual grid later)
    gridElem.textContent = "You chose " + numBombs + " bombs"
}


