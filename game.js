(function() {
    // Global variables to store puzzle data
    let puzzleData;
    let puzzleState;
    let stateLabel;
    let checkbox;
    let puzzleContainer;
    let errorDisplayEnabled = false;
    let numRows;
    let numColumns;
    const green = -1;
    const grey = 0;
    const blue = 1;
    const white = 2;
    const red = 3;

    // Function to fetch puzzle data from the API
    async function fetchPuzzleData() {
        try {
            const response = await fetch('https://prog2700.onrender.com/threeinarow/sample');
            if (!response.ok) {
                throw new Error('Failed to fetch puzzle data');
            }
            const jsonData = await response.json();

            puzzleData = jsonData.rows;
            numRows = puzzleData.length;
            numColumns = puzzleData[0].length;
            initializeGrid();
            createControls();
        } catch (error) {
            console.error(error);
        }
    }

    // Function to create checkbox and button controls
    function createControls() {

        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'controls';
        const button = document.createElement('button');
        
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'errorCheckbox';
        const label = document.createElement('label');
        stateLabel = document.createElement('label');
 
   
        button.textContent = 'Check';
        button.id = 'checkButton';


        controlsDiv.appendChild(button);
        controlsDiv.appendChild(stateLabel);
        controlsDiv.appendChild(checkbox);
        controlsDiv.appendChild(label);
 

        document.body.appendChild(controlsDiv);

        button.style.position = "absolute";
        button.style.top = `${puzzleContainer.offsetTop + puzzleContainer.offsetHeight}px`;
        button.style.left = `${puzzleContainer.offsetLeft + 300}px`;
        stateLabel.style.position = "absolute";
        stateLabel.style.top = `${puzzleContainer.offsetTop + puzzleContainer.offsetHeight}px`;
        stateLabel.style.left = `${puzzleContainer.offsetLeft + 430}px`;

        checkbox.style.position = "absolute";
        checkbox.style.top = `${puzzleContainer.offsetTop + puzzleContainer.offsetHeight + 40}px`;
        checkbox.style.left = `${puzzleContainer.offsetLeft + 300}px`;
        label.style.position = "absolute";
        label.style.top = `${puzzleContainer.offsetTop + puzzleContainer.offsetHeight + 40}px`;
        label.style.left = `${puzzleContainer.offsetLeft + 320}px`;

        label.htmlFor = 'errorCheckbox';
        label.textContent = 'Show incorrect squares';

        // Event listener for checkbox change
        checkbox.addEventListener('change', function() {
            toggleErrorDisplay();
        });

        // Event listener for button click
        button.addEventListener('click', function() {
            checkPuzzle();
        });
    }

    // Function to initialize the puzzle grid
    function initializeGrid() {
        puzzleContainer = document.getElementById('theGame');
        if (!puzzleContainer) {
            console.error("Puzzle container not found.");
            return;
        }
        const table = document.createElement('table');
        for (let i = 0; i < numRows; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < numColumns; j++) {
                const cell = document.createElement('td');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleClick);
                if (!puzzleData[i][j].canToggle) {
                    puzzleData[i][j].currentState = puzzleData[i][j].correctState;
                    updateSquareColor(cell, puzzleData[i][j].currentState);
                } else {
                    puzzleData[i][j].currentState = grey; 
                    updateSquareColor(cell, puzzleData[i][j].currentState);
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        puzzleContainer.appendChild(table);
    }

    // Function to handle click events on puzzle squares
    function handleClick(event) {
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        let currentState = puzzleData[row][col].currentState;
        if (puzzleData[row][col].canToggle) {
            currentState = (currentState + 1) % 3;
            puzzleData[row][col].currentState = currentState;
        } else {
            puzzleData[row][col].currentState = puzzleData[row][col].correctState;
        }
        updateSquareColor(cell, currentState);
    }

    // Function to update square color based on state
    function updateSquareColor(cell, state) {
        switch (state) {
            case grey:
                cell.style.backgroundColor = 'grey';
                break;
            case blue:
                cell.style.backgroundColor = 'blue';
                break;
            case white:
                cell.style.backgroundColor = 'white';
                break;
            default:
                console.error("state=" + state);
                cell.style.backgroundColor = 'green';
                break;
        }
    }

    function checkPuzzle() {
        let errorCount = 0;
        let allCellsCorrect = true;
    
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numColumns; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const currentState = puzzleData[i][j].currentState;
                const correctState = puzzleData[i][j].correctState;
    
                // Update currentState based on cell appearance
                puzzleData[i][j].currentState = currentState;
    
                if (currentState === grey) {  
                    allCellsCorrect = false;
                } else {
                    if (currentState !== correctState) {
                        errorCount++;
                        if (errorDisplayEnabled) {
                            cell.style.backgroundColor = 'red';
                        }
                    }
                }
            }
        }
    
        if (errorCount === 0) {
            if (allCellsCorrect) {
                puzzleState = 'You did it!!';
            } else {
                puzzleState = 'So far so good';
            }
        } else {
            puzzleState = 'Something is wrong';
        }
        stateLabel.textContent = puzzleState;
    }
    
    
    // Function to toggle error display
    function toggleErrorDisplay() {
        errorDisplayEnabled = checkbox.checked;
        if (errorDisplayEnabled) {
            const errorCells = document.querySelectorAll('td');
            errorCells.forEach(cell => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                const currentState = puzzleData[row][col].currentState;
                const correctState = puzzleData[row][col].correctState;
                if (currentState !== correctState) {
                    cell.style.backgroundColor = 'red';
                }
            });
        } else {
            // If errorDisplayEnabled is false, reset the background color of previously incorrect cells
            const incorrectCells = document.querySelectorAll('[style="background-color: red;"]');
            incorrectCells.forEach(cell => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                const currentState = puzzleData[row][col].currentState;
                updateSquareColor(cell, currentState);
            });
        }
    }
    
    
    

    // Event listener for page load
    window.addEventListener('load', fetchPuzzleData);
})();
