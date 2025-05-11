// Select the canvas element
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Get references to elements
const playButton = document.getElementById("playButton");
const openingScene = document.getElementById("openingScene");
const gameContainer = document.getElementById("gameContainer");
const backgroundMusic = new Audio("background_music.mp3");
backgroundMusic.loop = true; // Loop the music
const gameOverOverlay = document.getElementById("gameOverOverlay");
const gameOverText = document.getElementById("gameOverText");
const finalScore = document.getElementById("finalScore");
const retryButton = document.getElementById("retryButton");
const scoreboard = document.getElementById("scoreboard");
const level1Popup = document.getElementById("level1Popup");
const clickSound = new Audio("click.mp3");
backgroundMusic.loop = true;

// Preload the click sound
clickSound.load();

// Play button event
document.getElementById("playButton").addEventListener("click", () => {
  // Play background music
  backgroundMusic.play().catch((error) => {
    console.error("Failed to play music:", error);
  });

  // Play click sound
  clickSound.currentTime = 0; // Reset to the beginning
  clickSound.play().catch((error) => {
    console.error("Failed to play click sound:", error);
  });

  // Additional game logic
  console.log("Play button clicked");
});

function showLevel1Popup() {
  level1Popup.classList.add("show");

  // Hide the popup after 3 seconds
  setTimeout(() => {
    level1Popup.classList.remove("show");
  }, 1000);
}

// Event listener for the play button
playButton.addEventListener("click", () => {
  // Hide the opening scene and show the game container
  openingScene.style.display = "none";
  showLevel1Popup();
  // Show the scoreboard
  scoreboard.style.display = "block";
  // Start the game
  update();
});

// Game variables
let score = 0;
let gameOver = false;
let isLevel2 = false; // Track the current level
const secondTree = { x: 100, y: 0, width: 150, height: canvas.height, image: new Image() };
secondTree.image.src = "images/tree.png";

// Game assets
const background = { image: new Image() };
background.image.src = "images/Background.jpg";

const koala = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 200,
  width: 80,
  height: 80,
  image: new Image(),
  step: 30,
};
koala.image.src = "images/koala.png";

const leaf = { radius: 15, image: new Image() };
leaf.image.src = "images/leaf.png";

const insect = { radius: 15, image: new Image() };
insect.image.src = "images/insect.png";

const tree = {
  x: canvas.width / 2 - 75,
  y: 0,
  width: 150,
  height: canvas.height,
  image: new Image(),
};
tree.image.src = "images/tree.png";

// Leaf and insect arrays
let leaves = [];
let insects = [];

// Draw the tree
function drawTree() {
  ctx.drawImage(tree.image, tree.x, tree.y, tree.width, tree.height);

  // Draw second tree if in level 2
  if (isLevel2) {
    ctx.drawImage(secondTree.image, secondTree.x, secondTree.y, secondTree.width, secondTree.height);
  }
}

// Draw the koala
function drawKoala() {
  ctx.drawImage(koala.image, koala.x, koala.y, koala.width, koala.height);
}

// Draw leaves
function drawLeaves() {
  leaves.forEach((leafObj, index) => {
    ctx.drawImage(
      leaf.image,
      leafObj.x - leafObj.radius,
      leafObj.y - leafObj.radius,
      leafObj.radius * 2,
      leafObj.radius * 2
    );

    leafObj.y += 2; // Move leaf down

    // Detect collision with the koala
    if (
      koala.x < leafObj.x + leafObj.radius &&
      koala.x + koala.width > leafObj.x - leafObj.radius &&
      koala.y < leafObj.y + leafObj.radius &&
      koala.y + koala.height > leafObj.y - leafObj.radius
    ) {
      leaves.splice(index, 1); // Remove leaf
      score++; // Increase score
      document.getElementById("scoreboard").textContent = "Score: " + score;

      // Trigger level 2 when score reaches 5
      if (score === 5 && !isLevel2) {
        isLevel2 = true;
        alert("Level 2 unlocked! A new tree has appeared.");
      }
    }

    // Remove leaf if it goes out of bounds
    if (leafObj.y > canvas.height) {
      leaves.splice(index, 1);
    }
  });
}

// Draw insects
function drawInsects() {
  insects.forEach((insectObj, index) => {
    ctx.drawImage(
      insect.image,
      insectObj.x - insectObj.radius,
      insectObj.y - insectObj.radius,
      insectObj.radius * 2,
      insectObj.radius * 2
    );

    insectObj.y += 2; // Move insect down

    // Detect collision with the koala
    if (
      koala.x < insectObj.x + insectObj.radius &&
      koala.x + koala.width > insectObj.x - insectObj.radius &&
      koala.y < insectObj.y + insectObj.radius &&
      koala.y + koala.height > insectObj.y - insectObj.radius
    ) {
      gameOver = true; // End the game
      showGameOver();
    }

    // Remove insect if it goes out of bounds
    if (insectObj.y > canvas.height) {
      insects.splice(index, 1);
    }
  });
}

// Spawn a new leaf
function spawnLeaf() {
  const minX = isLevel2 ? Math.min(tree.x, secondTree.x) + 10 : tree.x + 10;
  const maxX = isLevel2
    ? Math.max(tree.x + tree.width, secondTree.x + secondTree.width) - 10
    : tree.x + tree.width - 10;
  const leafX = Math.random() * (maxX - minX) + minX;

  leaves.push({ x: leafX, y: 0, radius: leaf.radius });
}

// Spawn a new insect
function spawnInsect() {
  const minX = isLevel2 ? Math.min(tree.x, secondTree.x) + 10 : tree.x + 10;
  const maxX = isLevel2
    ? Math.max(tree.x + tree.width, secondTree.x + secondTree.width) - 10
    : tree.x + tree.width - 10;
  const insectX = Math.random() * (maxX - minX) + minX;

  insects.push({ x: insectX, y: 0, radius: insect.radius });
}

let isJumping = false;
let jumpStartY = koala.y;
let jumpHeight = 100; // How high the koala jumps
let jumpSpeed = 10; // Speed of the jump
let horizontalJumpSpeed = 20; // Horizontal speed for jumping between trees
let jumpDirection = null; 
// Handle key presses for koala movement
function handleKeyPress(event) {
  if (event.key === "ArrowRight") {
    // Move right but only if the koala is not at the rightmost position of the current tree
    if (koala.x + koala.width < (isLevel2 ? secondTree.x + secondTree.width : tree.x + tree.width)) {
      koala.x = Math.min(
        koala.x + koala.step,
        (isLevel2 ? secondTree.x + secondTree.width : tree.x + tree.width) - koala.width
      );
    } else {
      // Trigger jump when on the rightmost position of the current tree
      if (koala.x + koala.width === (isLevel2 ? secondTree.x + secondTree.width : tree.x + tree.width)) {
        // Jump and switch to the previous tree (go back to the first tree)
        if (isLevel2 && koala.x === secondTree.x + secondTree.width) {
          koala.x = tree.x + tree.width - koala.width; // Move the koala to the rightmost position of the first tree
        }
      }
    }
  } else if (event.key === "ArrowLeft") {
    // Move left but only if the koala is not at the leftmost position of the current tree
    if (koala.x > (isLevel2 ? secondTree.x : tree.x)) {
      koala.x = Math.max(koala.x - koala.step, isLevel2 ? secondTree.x : tree.x);
    } else {
      // Trigger jump when on the leftmost position of the current tree
      if (koala.x === (isLevel2 ? secondTree.x : tree.x)) {
        // Jump and switch to the next tree (go to the second tree)
        if (isLevel2 && koala.x === tree.x) {
          koala.x = secondTree.x + secondTree.width - koala.width; // Move the koala to the rightmost position of the second tree
        }
      }
    }
  } else if (event.key === "ArrowUp") {
    koala.y = Math.max(koala.y - koala.step, 0); // Move up but not out of bounds
  } else if (event.key === "ArrowDown") {
    koala.y = Math.min(koala.y + koala.step, canvas.height - koala.height); // Move down but not out of bounds
  }
}


// Show the game over overlay
function showGameOver() {
  gameOverOverlay.classList.add("show");
  gameOverText.textContent = "Game Over!";
  finalScore.textContent = "Score: " + score;
}

// Update the game
function update() {
  if (gameOver) {
    return; // Stop the game if it's over
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background if it is loaded
  if (background.image.complete) {
    ctx.drawImage(background.image, 0, 0, canvas.width, canvas.height);
  }

  drawTree();
  drawKoala();
  drawLeaves();
  drawInsects();

  requestAnimationFrame(update);
}

// Spawn leaves and insects at intervals
setInterval(spawnLeaf, 2000);
setInterval(spawnInsect, 5000);

// Listen for key presses
document.addEventListener("keydown", handleKeyPress);

// Retry button event listener
retryButton.addEventListener("click", () => {
  // Reset the game
  score = 0;
  gameOver = false;
  isLevel2 = false; // Reset level
  leaves = [];
  insects = [];
  document.getElementById("scoreboard").textContent = "Score: " + score;

  // Hide the game over screen and restart the game
  gameOverOverlay.classList.remove("show");
  update();
});

// Start the game
update();
