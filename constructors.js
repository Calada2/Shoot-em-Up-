//Creates and appends a layer (container) to the app stage
function createLayer(name)
{
    layers[name] = new PIXI.Container({width: width, height: height});
    app.stage.addChild(layers[name]);
}

//Returns a rocket sprite
function createRocket()
{
    let rocket = new PIXI.Sprite(getTexture('ship'));
    rocket.width = rocketWidth;
    rocket.height = rocketHeight;
    rocket.anchor.set(.5, .5);
    return rocket;
}

//Returns a parallax background tile and appends it to the background layer
function createBackgroundTile(texture)
{
    let tile = new PIXI.TilingSprite(getTexture(texture), 800, 600);
    tile.position.set(0,0);
    layers.background.addChild(tile);

    return tile;
}

//Creates the main menu
function createMenu()
{

    //The logo sprite is created and positioned
    menuElements.logo = new PIXI.Sprite(getTexture('logo'));
    menuElements.logo.position.set(50, 50);
    layers.menu.addChild(menuElements.logo);
    layers.menu.interactive = true;


    //Function responsible for changing the background tiles' position based on the current cursor position
    layers.menu.pointermove = e => {
        const pos = e.data.global;
        background.front.tilePosition.set((-pos.x - width/2) / 10 ,-(pos.y - height/2) / 10);
        background.middle.tilePosition.set(-(pos.x - width/2) / 15 ,-(pos.y - height/2) / 15);
        background.back.tilePosition.set(-(pos.x - width/2) / 20 ,-(pos.y - height/2) / 20);
    };

    //Creating the buttons in the menu
    menuElements.buttons = [
        createButton('GAME1', startGame),
        createButton('GAME2', startGame),
        createButton('GAME3', startGame),
        createButton('EXIT', quit)
    ];

    //Adding to buttons to the main menu
    for(let i = 0; i < 4; ++i)
    {
        layers.menu.addChild(menuElements.buttons[i]);
        menuElements.buttons[i].position.set(400 - 80, 250 + (i* 75));
    }

    //Creating and appending the text that shows the player's current best score
    menuElements.record = new PIXI.Text('Best Score: ' + record,{fontFamily : 'Arial', fontSize: 20, fill : 0xFFFFFF, align : 'right', stroke: 0x000000, strokeThickness: 2});
    menuElements.record.position.set(width-5, height-5);
    menuElements.record.anchor.set(1,1);
    layers.menu.addChild(menuElements.record);
}

//Creates the game's hud
function createUI()
{
    //The score counter is created and added to the hud
    scoreSprite = new PIXI.Text('0',{fontFamily : 'Arial', fontSize: 40, fill : 0xFFFFFF, align : 'right', stroke: 0x000000, strokeThickness: 4});
    layers.ui.addChild(scoreSprite);
    scoreSprite.anchor.set(.5, .5);
    scoreSprite.y = height - 8 - scoreSprite.height / 2;
    scoreSprite.visible = false;

    //The 'game over' text is created and added to the hud
    gameOverSprites.text = new PIXI.Text('GAME\nOVER',{fontFamily : 'Arial', fontSize: 100, fill : 0xFFFFFF, align : 'center', stroke: 0x000000, strokeThickness: 8});
    gameOverSprites.text.anchor.set(.5, .5);
    gameOverSprites.text.position.set(width/2, height/2 - 30);
    gameOverSprites.text.visible = false;
    layers.ui.addChild(gameOverSprites.text);

    //The 'new record' text is created and added to the hud
    gameOverSprites.record = new PIXI.Text('New Record!',{fontFamily : 'Arial', fontSize: 46, fill : 0xf5c542, align : 'center', stroke: 0x000000, strokeThickness: 4});
    gameOverSprites.record.anchor.set(.5, .5);
    gameOverSprites.record.position.set(width/2, height/2 + 130);
    gameOverSprites.record.visible = false;
    layers.ui.addChild(gameOverSprites.record);
}

//Creates a button
function createButton(text /*The text written on the button*/, action /*A function that runs when the button is clicked*/)
{
    //Creates the button container
    const container = new PIXI.Container({width: 160, height: 70});
    container.cursor = 'pointer';
    container.interactive = true;

    //Creates a sprite for the button background
    container.bg = new PIXI.Sprite(getTexture('button'));

    //The background is tinted pink
    container.bg.tint = 0xEE88FF;

    //Creates the text that is visible on the button
    container.text = new PIXI.Text(text, {fontFamily : 'Arial', fontSize: 30, fill : '#EEEEEE', align : 'center'});
    container.text.position.set((160 - container.text.width) / 2,20);
    container.addChild(container.bg, container.text);

    //Functions that change the button background's tint if the mouse enters and leaves the button
    container.pointerover = function(e){
        this.bg.tint = 0x55CC55;
    };
    container.pointerout = function(e){
        this.bg.tint = 0xEE88FF;
    };

    //The given function is assigned to run when the button is pressed
    container.click = action;

    return container;
}
