  ///////////////////////////////////
 // Steven F. - Memory Game - 2019
///////////////////////////////////

// Settings
var cardsUsed = 12;
var numRows = 3;

var x = 0;
var y = 0;

var playerName = ["<span class='red-player'>Player 1</span>", "<span class='blue-player'>Player 2</span>"];

// Core
var turn = 0;
var score = [0,0];
var firstCard, secondCard, turnText;
var player, game, gc, winner, option;
var player1Score, player2Score;

var canFlip = false;
var autoNewGame = false;

var matches = 0;
var maxMatches;

// Card images
var cardImages = {
    pentagon: "images/Shape1.png",
    box: "images/Shape2.png",
    triangle: "images/Shape3.png",
    star: "images/Shape4.png",
    diamond: "images/Shape5.png",
    bolt: "images/Shape6.png",
    heart: "images/Shape7.png",
    circles: "images/Shape8.png",
}

// List of card image names.
var cardList = [];

function start() {
    // Initialize all elements.
    gc = document.getElementById("grid-container");
    game = document.getElementById("game");
    turnText = document.getElementById("player");
    winner = document.getElementById("winner");
    player1Score = document.getElementById("player1-score");
    player2Score = document.getElementById("player2-score");
    ngButton = document.getElementById("ng-button");
    option = document.getElementById("rules-dropdown");
    
    // Store card names
    for (var key in cardImages) {
        cardList.push(key);
    }
    
    // Start a new game once loaded.
    newGame();
    
    // New Game Button
    ngButton.onclick = () => {
        newGameButtonClicked()
    }
}

function generateCards() {
    for (y = 0;y < numRows;y++) {
        for (x = 0;x < cardsUsed/numRows;x++) {
            var card = document.createElement("div");
            card.className = "playing-card";
            
            // The face elements of the card.
            let cardFaceUp = document.createElement("div");
            let cardFaceDown = document.createElement("div");
            
            cardFaceUp.className = "card-up";
            cardFaceDown.className = "card-down";
            
            card.appendChild(cardFaceUp);
            card.appendChild(cardFaceDown);
            
            // When the card is clicked.
            card.onclick = function() {
                if (canFlip && cardFaceUp.hasAttribute('data-shape')) {
                    flip(this, cardFaceUp.dataset.shape);
                }
            }
            
            gc.appendChild(card);
        }
        // gc.appendChild(row);
    }
    
    // Add shuffled shapes
    addRandomShapes()
}

// Flips the card and checks if any matches were made.
function flip(card, face) {
    // Prevents user from clicking on matched cards, and cards that they just clicked on.
    if (card.dataset.matched == "true" || card.hasAttribute("data-first")) {
        return;
    } else {
        card.classList.toggle("flip");
    }
    
    // Create new objects for the first and second card, with the element and face.
    secondCard = firstCard ? {Element: card, Face: face} : null
    firstCard = secondCard ? firstCard : {Element: card, Face: face}
    
    if (!secondCard) {
        firstCard.Element.dataset.first = "true";
    }
    
    // When 2 cards are selected
    if (firstCard && secondCard) {
        canFlip = false
        
        var matchFound = checkMatch();
        
        if (matchFound) {
            matches++;
            score[turn]+=1;
            updateScores();
        }
        
        turn = turn == 0 ? 1 : 0;
        
        // Small delay for updating the text field,
        // as it looks odd when it updates immediately.
        setTimeout(() => {
            updateTurn(turn);
        }, 400)
    }
    
    // No matches left, declare a winner, start a new game.
    if (matches >= maxMatches) {
        autoNewGame = true;
        var winningPlayer = score[0] > score[1] ? playerName[0] : playerName[1];
        
        winner.style.display = "block";
        winner.innerHTML = score[0] == score[1] ? "Tie" : winningPlayer +" WINS!";
        
        setTimeout(() => winner.style.display = "none",8000);
        setTimeout(() => {
            if (autoNewGame) {
                newGame();
            }
        },6000);
    }
}

function checkMatch() {
    if (firstCard.Face == secondCard.Face) {
        firstCard.Element.dataset.matched = "true";
        secondCard.Element.dataset.matched = "true";
        
        resetPicks();
        
        canFlip = true;
        return true;
    } else {
        setTimeout(() => {
            firstCard.Element.classList.toggle("flip");
            secondCard.Element.classList.toggle("flip");
            
            resetPicks()
            
            setTimeout(() => canFlip = true, 800);
        }, 1000);
    }
    return false
}

function resetPicks() {
    if (firstCard.Element.hasAttribute("data-first")) {
        firstCard.Element.removeAttribute("data-first");
    }
    firstCard = null;
    secondCard = null;
}

// Adds shapes to card faces and labels them.

function addRandomShapes() {
    var cardFaces = document.getElementsByClassName("card-up");
    var shapes = [];
    maxMatches = cardFaces.length / 2;
    
    for (var i = 0;i < maxMatches; i++) {
        // Ternary to allow each shape to appear at least once, then select random shapes.
        let shape = i >= cardList.length ? Math.floor(Math.random() * cardList.length) : i;
        
        shapes.push(cardList[shape]);
        shapes.push(cardList[shape]);
    }
    
    shuffle(shapes)
    
    for (var k = 0;k < cardFaces.length;k++) {
        var c = cardFaces[k];
        c.dataset.shape = shapes[k];
        c.style.backgroundImage = "url('"+cardImages[shapes[k]]+"')";
        c.style.backgroundSize = "cover";
    }
}

function newGame() {
    x = 0;
    y = 0;
    matches = 0;
    turn = 0;
    maxMatches = null;
    canFlip = false;
    autoNewGame = false;
    score = [0,0];
    
    updateScores();
    
    var elements = document.getElementsByClassName("playing-card");
    
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    
    if (cardsUsed % numRows > 0 || cardsUsed % 2 > 0) {
        game.innerHTML = "<strong>ERROR:</strong><br />The number of cards must be divisible by the number of rows.<br />The number of cards must also be divisible by 2<br />Please change the number of cards and try again.";
        return;
    }
    
    gc.setAttribute("style", "grid-template-columns: repeat(" +cardsUsed/numRows+ ", auto);");
    
    // Start adding cards
    generateCards();
    updateTurn(turn);
    canFlip = true;
}

function parseOption(o) {
    // Simple regular expressions for checking
    // the number of cards, and rows requested in the select box.
    var t = {};
    var m = o.match(/(\d+)c(\d+)r/);
    
    t.cardsUsed = m[1];
    t.numRows = m[2];
    
    return t;
}

function newGameButtonClicked() {
    if (option && !option.value) {
        return;
    }
    
    var rules = parseOption(option.value);
    
    cardsUsed = rules.cardsUsed;
    numRows = rules.numRows;
    
    newGame();
}

function updateTurn(t) {
    if (turnText) {
        turnText.innerHTML = playerName[t] + " is playing.";
    }
}

function updateScores() {
    player1Score.innerHTML = score[0];
    player2Score.innerHTML = score[1];
}

// Fisher Yates shuffle algorithm:
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

