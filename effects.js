//A filter that blurs a container's content
const blurFilter = new PIXI.filters.BlurFilter(6, 5);

//Creates an explosion
function drawExplosion(x, y)
{

    //A pixi container for the explosion particles is created
    const explosionContainer = new PIXI.Container();
    explosionContainer.position.set(x, y);
    explosionContainer.filters = [blurFilter]; //The blur filter is applied to it

    //An array that contains all the explosion particles
    const explosionParticles = [];

    for(let i = 0; i < 300; ++i)
    {
        //The particle sprite is created
        const particle = new PIXI.Sprite(getTexture('flame'));

        //It gets a random size, rotation and speed
        particle.rotation = Math.random() * Math.PI * 2;
        particle.speed = (Math.random() + .15) * 2;
        particle.width = particle.height = Math.random() * 10 + 5;

        //Gives a random red-shaded tint to the sprite
        particle.tint = (0x00FFFF * Math.random()) + 0xFF0000;

        //The particle is added to the container and to the array
        explosionParticles.push(particle);
        explosionContainer.addChild(particle);
    }

    //The container is added to the scene
    layers.effects.addChild(explosionContainer);

    //An explosion sound effect is played
    playAudio('explosion.wav', false, .5);

    //The animation responsible for the explosion particles' movement
    //The animation runs every 10ms
    const explosionAnimation = setInterval(()=>{

        //Cycles through all explosion particles
        for(let i in explosionParticles)
        {
            const particle = explosionParticles[i];

            //The particles position is changed based on its speed and rotation
            particle.x += Math.cos(particle.rotation) * particle.speed;
            particle.y += Math.sin(particle.rotation) * particle.speed;
        }

        //The container becomes a bit more transparent
        explosionContainer.alpha -= .01;

        //If the container is fully transparent it is removed from the scene and the animation is stopped
        if(explosionContainer.alpha <= 0)
        {
            layers.effects.removeChild(explosionContainer);
            clearInterval(explosionAnimation);
        }

    },10);
}

//Updates the score counter
function updateScoreboard()
{
    //The written score is updated
    scoreSprite.text = score;
    //The counter's position is changed to avoid overflowing
    scoreSprite.x = width - 20 - scoreSprite.width / 2;

    //Animation that at first increases and than decreases the scoreboard's size
    let scoreAngle = 0;
    let scoreGlowAnimation = setInterval(()=>{

        //the scoreAngle variable is incremented
        scoreAngle += Math.PI / 40;

        //The scale is changed based on the sine of scoreAngle
        //The value of sin(scoreAngle) goes from 0 to 1, then to 0 again
        scoreSprite.scale.set(Math.sin(scoreAngle) / 2 + 1);

        //If the score angle reaches its limit the animation is stopped
        if(scoreAngle >= Math.PI)
        {
            clearInterval(scoreGlowAnimation);
        }

    },10);
}

//Displays a text going upwards and fading away
//It is used for bonus points and for the 'Combo Broken' text
function getPointText(x, y, amount, color, alpha = 1)
{
    //Creates the text container for the given t4ext
    let text = new PIXI.Text(amount,{fontFamily : 'Arial', fontSize: 24, fill : color, align : 'center', stroke: 0x666666, strokeThickness: 1.5});
    text.anchor.set(.5, .5);
    text.position.set(x, y);
    text.alpha = alpha;

    //The text is added to the scene
    layers.ui.addChild(text);

    //Animation that moves and hides the text
    let pointTextAnimation = setInterval(()=>{

        //The y position and the alpha are decreased
        text.y -= 1 ;
        text.alpha -= .01;

        //If the text becomes invisible it is removed from the scene and the animation is stopped
        if(text.alpha <= 0)
        {
            clearInterval(pointTextAnimation);
            layers.ui.removeChild(text);
        }

    },10);
}

//Plays an audio file
function playAudio(file, loop = false, volume = 1)
{
    let audio = new Audio('audio/' + file);
    audio.loop = loop;  //If true, the audio will automatically replay itself
    audio.volume = volume;  //Changes the volume of the audio
    audio.play();
}