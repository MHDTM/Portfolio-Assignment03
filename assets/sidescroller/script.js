const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let scrollSpeed = 2; // pixels per frame
let maxScrollSpeed = 8;
let scrollSpeedIncreaseRate = 600; // every 600 frames (~10 seconds)
let scrollSpeedTimer = 0;
let normalScrollSpeed = scrollSpeed;  // initial normal speed
let gravity = 0.5;
let ground = canvas.height - 400; 
let score = 0;
let scoreTimer = 6;
let scoreIncreaseRate = 60; // Increase score every 60 frames (~1 second at 60fps)
burstActive = false;
let burstDuration = 300; // frames (~5 seconds)
let burstTimer = 0;
let burstInterval = 1200; // every ~20 seconds
let burstSpeed = 8;
let burstCooldownTimer = 0;
let gameOver = false;
let flashAlpha = 0;


let platforms = [
  { x: 1000, y: ground - 50, width: 100, height: 20 },
  { x: 1300, y: ground - 75, width: 100, height: 20 },

]

let minSpacing = 150;
let maxSpacing = 250;

let player = {

  x: platforms[0].x - 0,
  y: platforms[0].y - 100, // 50 is player height
  width: 50,
  height: 50,
  color: "green",
  dy: 0,
  dx: 0,
  speed: 4,
  jumping: false,
  facingRight: true
};

// Define image arrays before loading frames
let playerImages = {

  idle: [],
  run: [],
  jump: [],
  fall: []
};

let currentFrame = 0;
let frameCounter = 0;
let frameDelay = 6;

// Load player sprite frames
function loadPlayerFrames() {
  
  // Idle and Run animations
  for (let i = 0; i <= 10; i++) {
    let img = new Image();
    img.src = `assets/player/Idle/idle${i.toString().padStart(3, '0')}.png`;
    playerImages.idle.push(img);
  }

  for (let i = 0; i <= 11; i++) {
    let img = new Image();
    img.src = `assets/player/Run/run${i.toString().padStart(3, '0')}.png`;
    playerImages.run.push(img);
  }

  let jumpImg = new Image();
  jumpImg.src = `assets/player/Jump/jump000.png`;
  playerImages.jump.push(jumpImg);

  let fallImg = new Image();
  fallImg.src = `assets/player/Fall/fall000.png`;
  playerImages.fall.push(fallImg);
}

loadPlayerFrames();

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);
document.addEventListener("keydown", (e) => {
  if (e.key === "r" && gameOver) {
    window.location.reload(); // simplest full restart
  }
});

function update() {

player.dx = 0; // Reset horizontal velocity

if (keys["ArrowLeft"] || keys["a"]) {
  player.dx = -player.speed;
  player.facingRight = false;
}
if (keys["ArrowRight"] || keys["d"]) {
  player.dx = player.speed;
  player.facingRight = true;
}

// Apply movement using dx
player.x += player.dx;



  // Jump
  if ((keys["ArrowUp"] || keys["w"]) && !player.jumping) {
    player.dy = -12;
    player.jumping = true;
  }

  // Gravity
  player.dy += gravity;
  player.y += player.dy;

 //platform collision 
let onPlatform = false;

for (let platform of platforms) {
  const horizontallyOverlapping =
    player.x + player.width > platform.x &&
    player.x < platform.x + platform.width;


  // Top Collision (existing logic)
  const fallingOntoPlatform =
    player.dy >= 0 &&
    player.y + player.height <= platform.y + player.dy &&
    player.y + player.height + player.dy >= platform.y;

if (fallingOntoPlatform && horizontallyOverlapping) {
  player.y = platform.y - player.height;
  player.dy = 0;
  player.jumping = false;
  onPlatform = true;

}

  const verticallyOverlapping =
    player.y + player.height > platform.y &&
    player.y < platform.y + platform.height;


// Side collision — always active, not just on player input
if (verticallyOverlapping && horizontallyOverlapping) {
  const overlapLeft = (player.x + player.width) - platform.x;
  const overlapRight = (platform.x + platform.width) - player.x;

  if (overlapLeft < overlapRight) {
    // Colliding from left
    player.x = platform.x - player.width;
  } else {
    // Colliding from right
    player.x = platform.x + platform.width;
  }
}
}

// Scroll world left
platforms.forEach(p => p.x -= scrollSpeed);

if (!burstActive && burstCooldownTimer >= burstInterval) {
  burstActive = true;
  normalScrollSpeed = scrollSpeed;  // save current normal speed before burst
  scrollSpeed = burstSpeed;
  burstTimer = 0;
  flashAlpha = 0.6; // <<< this line triggers the flash
}

if (burstActive) {
  burstTimer++;
  if (burstTimer >= burstDuration) {
    burstActive = false;
    scrollSpeed = normalScrollSpeed;  // restore normal speed
    burstCooldownTimer = 0;
  }
}

// Generate new platforms
let rightmostX = Math.max(...platforms.map(p => p.x));
if (rightmostX < canvas.width + 500) {
  let spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;

  let newPlatformY = ground - 50 - Math.random() * 150;
  newPlatformY = Math.max(newPlatformY, ground - 200);

  let furthestX = Math.max(...platforms.map(p => p.x + p.width));

  let newPlatform = {
    x: furthestX + spacing,
    y: newPlatformY,
    width: 100,
    height: 20
  };

  platforms.push(newPlatform);
}


// Remove off-screen platforms
platforms = platforms.filter(p => p.x + p.width > 0);

if (onPlatform) {
  player.x -= scrollSpeed;
}

// If not on ground or a platform, stay in air
if (!onPlatform && player.y + player.height < ground) {
  player.jumping = true;
}

  // Ground collision
  //if (player.y + player.height >= ground) {
   // player.y = ground - player.height;
   // player.dy = 0;
   // player.jumping = false;
 // }

  // Keep player within screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

scoreTimer++;
if (scoreTimer >= Math.max(10, Math.floor(60 / scrollSpeed))) {
  score++;
  scoreTimer = 0;
}

scrollSpeedTimer++;
if (scrollSpeedTimer >= scrollSpeedIncreaseRate && scrollSpeed < maxScrollSpeed) {
  scrollSpeed += 0.5;
  scrollSpeedTimer = 0;
}

// Death condition: player falls off screen
if (player.y > canvas.height) {
  gameOver = true;
}

if (gameOver) {
  drawGameOverScreen();
  return;
}

burstCooldownTimer++;

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
//  ctx.fillStyle = "#654321";
//  ctx.fillRect(0, ground, canvas.width, 50);

  ctx.fillStyle = "#87CEEB"; // sky blue background
ctx.fillRect(0, 0, canvas.width, canvas.height);

//  horizon layer
ctx.fillStyle = "#c2f0c2"; // light green for far grass/terrain
ctx.fillRect(0, ground + 50, canvas.width, canvas.height - ground - 50);

  //platform
ctx.fillStyle = "#888";
platforms.forEach(p => {
  ctx.fillRect(p.x, p.y, p.width, p.height);
});
  
  // Choose animation
  let anim;
  if (player.jumping && player.dy < 0) {
    anim = playerImages.jump;
  } else if (player.jumping && player.dy > 0) {
    anim = playerImages.fall;
  } else if (keys["ArrowLeft"] || keys["ArrowRight"] || keys["a"] || keys["d"]) {
    anim = playerImages.run;
  } else {
    anim = playerImages.idle;
  }

  // Draw player
  let frame = anim.length > 1 ? anim[currentFrame] : anim[0];
  if (frame && frame.complete) {
    if (player.facingRight) {
      ctx.drawImage(frame, player.x, player.y, player.width, player.height);
    } else {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(frame, -player.x - player.width, player.y, player.width, player.height);
      ctx.restore();
    }
  }

  if (anim.length > 1) {
    frameCounter++;
    if (frameCounter >= frameDelay) {
      currentFrame = (currentFrame + 1) % anim.length;
      frameCounter = 0;
    }
  } else {
    currentFrame = 0;
  }



ctx.fillStyle = "gold";
ctx.font = "bold 28px Arial";
ctx.strokeStyle = "black";
ctx.lineWidth = 3;
ctx.strokeText("Score: " + score, 20, 40);  // Outline for contrast
ctx.fillText("Score: " + score, 20, 40);    // Gold fill

      if (flashAlpha > 0) {
  ctx.fillStyle = `rgba(255, 215, 0, ${flashAlpha})`; // goldish flash
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  flashAlpha -= 0.01; // fades out slowly
}
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "24px Arial";
  ctx.font = "28px Arial";
  ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2);
  
  ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 20);

  if (flashAlpha > 0) {
  ctx.fillStyle = `rgba(255, 215, 0, ${flashAlpha})`; // goldish flash
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  flashAlpha -= 0.01; // fades out slowly
}
}

update();