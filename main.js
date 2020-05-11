
//Create PIXI Application
const width = 800;
const height = 600;
const app = new PIXI.Application({width: width, height: height});


//Append it to the body
document.body.appendChild(app.view);
app.view.className = 'app';


//Load textures
app.loader.onComplete.add(loadComplete);
app.loader.baseUrl = 'imgs';
app.loader
    .add('bgFront', 'stars.png')
    .add('bgMiddle', 'fog.png')
    .add('bgBack', 'galaxy.jpg')
    .add('ship', 'spaceship.png')
    .add('missile', 'missile.png')
    .add('flame', 'flame.png')
    .add('splash', 'splash.png')
    .add('logo', 'logo.png')
    .add('button', 'button.png');
app.loader.load();

//Container for the different layers that make up the scene
const layers = {};

//Sprite containers
const background = {};
const menuElements = {};
const gameOverSprites = {};
let scoreSprite;

//Size of spceship sprite
const rocketWidth = 100;
const rocketHeight = 70;


//Game variables
const player = {
    speedX: 0,
    speedY: 0,
    rocketCooldown: 0
};
let score;
let combo;
let kills;
let record = localStorage.getItem('shootEmUpRecord') ?? 0; //Load record from localStorage, if it doesnt exists it's automatically 0
let prevTime;
let spawnCooldown = 2000;
let gameInProgress = false;

//Runs when textures are loaded
function loadComplete()
{
    //Separate rendered objects into different layers
    createLayer('background');
    createLayer('game');
    createLayer('effects');
    createLayer('ui');
    createLayer('menu');
    createLayer('splash');

    //Create parallax background
    background.back = createBackgroundTile('bgBack');
    background.middle = createBackgroundTile('bgMiddle');
    background.front = createBackgroundTile('bgFront');


    createMenu();
    createUI();

    //Displays and then hides the splash screen
    showSplashScreen();

    //Create player sprite
    player.view =  createRocket();

    //Starts the gameloop
    prevTime = Date.now();
    app.ticker.add(gameloop);

}

//Returns texture by name
const getTexture = name => app.loader.resources[name].texture;


function gameloop()
{

    //Calculates the delta time (time elapsed from the last time the gameloop ran)
    const deltaTime = Math.min(Date.now() - prevTime, 1000);
    prevTime = Date.now();

    //If a game is in progress
    if(gameInProgress)
    {

        //Player controls are only enabled if the player is alive
        if(player.alive)
        {
            //Decreasing shooting cooldown
            player.rocketCooldown = Math.max(player.rocketCooldown - deltaTime, 0);

            //Changing player speed
            player.speedX = (((keyPressed.right - keyPressed.left) * 1.8 * deltaTime) + (player.speedX * (1000 - deltaTime))) / 1000;
            player.speedY = (((keyPressed.down - keyPressed.up) * 1.8 * deltaTime) + (player.speedY * (1000 - deltaTime))) / 1000;

            let heightHalf = rocketHeight/2;
            let widthHalf = rocketWidth/2;

            //If the players moves out of playable zone the speed is set to 0
            if(player.view.x > width - widthHalf && player.speedX > 0) player.speedX = 0;
            else if(player.view.x < widthHalf && player.speedX < 0) player.speedX = 0;
            if(player.view.y > height - heightHalf && player.speedY > 0) player.speedY = 0;
            else if(player.view.y < heightHalf && player.speedY < 0) player.speedY = 0;

            //Changing player position based on speed and delta time
            player.view.x += player.speedX * deltaTime * .3;
            player.view.y += player.speedY * deltaTime * .3;

            //If fire key is pressed and shooting cooldown is zero, a missile is shot
            if(keyPressed.fire && player.rocketCooldown === 0)
            {
                missiles.push(new Missile(player.view.x, player.view.y, 0));
                player.rocketCooldown = 350;
                playAudio('shoot.flac');
            }
        }


        //Updates missile position and checks for collision with enemy ships
        for(let i in missiles)
        {
            if(missiles[i].active)
            {
                missiles[i].move(deltaTime);
                missiles[i].checkForCollision();
            }
        }

        //Updates enemy position and checks for collisions with the player
        for(let i in enemies)
        {
            if(enemies[i].alive)
            {
                enemies[i].move(deltaTime);
                enemies[i].checkForCollision();
            }

        }

        //Decreases the enemy spawn cooldown
        spawnCooldown = Math.max(spawnCooldown - deltaTime, 0);


        //If spawn cooldown is 0 a random enemy spawns
        if(spawnCooldown === 0)
        {
            enemies.push(new Enemy(Math.floor(Math.random() * 3), Math.random() * height));
            spawnCooldown = 2000;  //Spawn cooldown is set to 2 seconds
        }

        //Parallax moving of background tiles
        background.front.tilePosition.x -= .15 * deltaTime;
        background.middle.tilePosition.x -= .1 * deltaTime;
        background.back.tilePosition.x -= .05 * deltaTime;
    }
}

//Colors of the different enemy types
const enemyColors = [0xFF7722, 0xFFCC22, 0x11BB33];

//Container for enemies
const enemies = [];

//Conteiner for missiles
const missiles = [];



//Runs when the player gets a kill
function getPoints()
{
    if(player.alive) //If the player kills an enemy after dying it doesn't count
    {
        ++kills;
        score += 10 + combo++;
        updateScoreboard();
    }

}

//Runs when a shot is missed or if an enemy gets away
function breakCombo(rightSide, y)
{
    if(combo > 1)
    {
        getPointText(rightSide ? width - 100 : 100, y, 'Combo Broken', 0xAAAAAA, .6);
        playAudio('lose.wav');
    }
    combo = 0;
}

//Shows and hides the splash screen
function showSplashScreen()
{
    //Splash screen sprite is created
    let splashScreen = new PIXI.Sprite(getTexture('splash'));
    layers.splash.addChild(splashScreen);

    //Menu is hidden to disable interactivity
    layers.menu.visible = false;

    //Hides splash screen 2 seconds later
    setTimeout(()=>{

        //Menu is enabled
        layers.menu.visible = true;

        //Fading animation of splash screen
        let splashAnimation = setInterval(()=>{

            splashScreen.alpha -= .01;

            //If alpha is 0 the splash screen becomes hidden
            if(splashScreen.alpha <= 0)
            {
                layers.splash.visible = false;
                clearInterval(splashAnimation);
            }
        },10);

    }, 2000);

}

//Runs when a game is started
function startGame()
{
    //Missile and enemy arrays are cleared
    missiles.length = 0;
    enemies.length = 0;

    //Game variables are reset
    gameInProgress = true;
    player.rocketCooldown = 0;
    score = 0;
    combo = 0;
    kills = 0;
    spawnCooldown = 2000;

    //The player sprite is added to the scene
    layers.game.addChild(player.view);
    player.view.position.set(100, height/2);
    player.alive = true;

    //Background tile position reset
    background.front.tilePosition.set(0,0);
    background.middle.tilePosition.set(0,0);
    background.back.tilePosition.set(0,0);

    //Menu is hidden
    layers.menu.visible = false;

    //Scoreboard becomes visible
    scoreSprite.visible = true;
    updateScoreboard();
}

//Runs when the player dies
function gameOver()
{
    //If the score is a new record, it is saved and a message is displayed
    if(score > record)
    {
        record = score;
        save();
        gameOverSprites.record.visible = true;

        //The displayed record is updated
        menuElements.record.text = 'Best Score: ' + record;
    }
    //The game over text is displayed
    gameOverSprites.text.visible = true;

    //The player is remove from the scene
    player.alive = false;
    layers.game.removeChild(player.view);

    //Hides the game over screen and returns to the menu after some time
    setTimeout(endGame, 2500);
}

//Runs after the game over screen
function endGame()
{
    //The game layer is cleared, all rockets and missiles are removed.
    layers.game.removeChildren(0, layers.game.children.length);

    //Setting game variables
    combo = 0;
    gameInProgress = false;

    //Certain UI elements are set to hidden
    scoreSprite.visible = false;
    player.alive = false;
    layers.menu.visible = true;
    gameOverSprites.text.visible = false;
    gameOverSprites.record.visible = false;

}

//Runs when the exit button is clicked
const quit = () => window.location.href = 'https://www.playngo.com/';


//Saves the record into localStorage
const save = () => localStorage.setItem('shootEmUpRecord', record);


//Checks if a given point is inside a rotated rectangle
function isPointInRect(p, rect)
{
    const rotSin = Math.sin(-rect.rotation);
    const rotCos = Math.cos(-rect.rotation);

    let p2 = {
        x: p.x - rect.x,
        y: p.y - rect.y
    };

    const xNew = p2.x * rotCos - p2.y * rotSin;
    const yNew = p2.x * rotSin + p2.y * rotCos;

    p2.x = xNew + rect.x;
    p2.y = yNew + rect.y;

    const widthHalf = rect.width / 2;
    const heightHalf = rect.height / 2;

    return ((p2.x > rect.x - widthHalf && p2.x < rect.x + widthHalf) && (p2.y > rect.y - heightHalf && p2.y < rect.y + heightHalf));
}

//Check if a non-rotated rectangle collides with a rotated one
function isRectInRect(rect1, rect2)
{
    const heightHalf = rect1.height / 2;
    const widthHalf = rect1.width / 2;

    //If any of the vertices is inside the 2nd rectangle, the rectangles collide
    return  isPointInRect({x: rect1.x - widthHalf, y: rect1.y - heightHalf}, rect2) ||
            isPointInRect({x: rect1.x - widthHalf, y: rect1.y + heightHalf}, rect2) ||
            isPointInRect({x: rect1.x + widthHalf, y: rect1.y - heightHalf}, rect2) ||
            isPointInRect({x: rect1.x + widthHalf, y: rect1.y + heightHalf}, rect2);
}


//Play background music if user click on page
let bgmPlaying = false;
document.addEventListener('click', ()=>
{
    if(!bgmPlaying)
    {
        playAudio('music.mp3', true, .4);
        bgmPlaying = true;
    }
});


