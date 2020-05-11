/*
There are 3 types of enemies
Orange: Follows a random wave pattern
Yellow: Flies in a random direction, if it hits the wall it bounces back
Green: Starts from a random position and goes towards the player y-position
 */
class Enemy
{
    constructor(type, y)
    {
        this.type = type;
        this.alive = true;

        //Create enemy sprite
        this.view = createRocket();
        this.view.tint = enemyColors[type]; //The enemy is colored based on its type
        this.view.position.set(width + 50, y);
        this.view.rotation = Math.PI;
        layers.game.addChild(this.view);


        //Set enemy speed
        this.ax = -1;
        this.ay = Math.random() * 2 - 1;
        this.speed = Math.log10(10 + kills);

        //Previous position of enemy
        this.prevPos = {x: width + 50, y: y};


        //If enemy type is 0 get extra properteis
        if(type === 0)
        {
            this.waveHeight = (Math.random() + .5)/2;
            this.age = 0;
        }

    }
    move(deltaTime)
    {

        //The next Y position of the enemy
        let nextY = this.view.y + this.ay;

        //Different behaviour for each of the enemy types
        switch(this.type)
        {
            case 0:

                if(nextY < 0) this.age = -Math.PI * 250;
                else if(nextY > height) this.age = Math.PI * 250;

                this.ay = Math.cos(this.age/500) * this.waveHeight;

                this.age += deltaTime;

                break;
            case 1:

                if(nextY < 0 || nextY > height) this.ay = - this.ay;

                break;
            case 2:

                this.ay = Math.sin(Math.atan2(player.view.y - this.view.y, player.view.x - this.view.x)) * 1.5;

                break;
        }


        //Save previous position
        this.prevPos.x = this.view.x;
        this.prevPos.y = this.view.y;

        //Change current position based on speed and delta time
        this.view.x += this.ax * this.speed * deltaTime * .16;
        this.view.y += this.ay * this.speed * deltaTime * .16;

        //Stop rocket from going out of the map
        this.view.y = Math.max(0, Math.min(height, this.view.y));

        //Update sprite rotation based on the enclosed angle of the current and previous position
        this.view.rotation = Math.atan2(this.view.y - this.prevPos.y, this.view.x - this.prevPos.x);

    }
    checkForCollision()
    {
        //If rocket is outside the play-area the rocket destroys itself
        if(this.view.x < -(rocketWidth / 2))
        {
            this.kill(true);
        }
        //Detect player and rocket collision
        else if(player.alive && isRectInRect(player.view, this.view))
        {
            gameOver();
            drawExplosion(player.view.x, player.view.y);
        }
    }
    kill(self = false)
    {

        if(self)
        {
            //If enemy dies by itself the combo is broken
            breakCombo(false, this.view.y);
        }
        else
        {
            //Show explosion and bonus points
            drawExplosion(this.view.x, this.view.y);
            if(combo > 0)
                getPointText(this.view.x, this.view.y, '+' + combo, this.view.tint);
        }

        //Enemy is removed from scene
        this.alive = false;
        layers.game.removeChild(this.view);

    }
}


class Missile
{
    constructor(x, y, angle)
    {
        //Create missile sprite
        this.view = new PIXI.Sprite(getTexture('missile'));
        this.view.anchor.set(.5, .5);
        this.view.position.set(x, y);
        this.view.width = 60;
        this.view.height = 12;

        //Set missile direction based on given angle
        this.ax = Math.cos(angle);
        this.ay = Math.sin(angle);

        this.active = true;

        //Add sprite to scene before ship sprites
        layers.game.addChildAt(this.view, 0);
    }
    move(deltaTime)
    {
        //Update position based on direction and delta time
        this.view.x += this.ax * deltaTime * .7;
        this.view.y += this.ay * deltaTime * .7;
    }
    checkForCollision()
    {
        //Cycle through enemies
        for (let i in enemies)
        {
            let en = enemies[i];

            //If enemy is alive and the midpoint of the missile is inside the enemy, the enemy dies
            if (en.alive && isPointInRect(this.view, en.view))
            {
                //When hitting the enemy the missile itself also dies
                en.kill();
                this.kill();

                //Player gets  points for kill
                getPoints();

                break;
            }
        }

        //If missile goes out of the map it 'dies' and the combo is broken
        if(this.view.x > width + 30)
        {
            this.kill();
            breakCombo(true, this.view.y);
        }
    }
    kill()
    {
        //Missile is removed from the scene
        this.active = false;
        layers.game.removeChild(this.view);
    }
}
