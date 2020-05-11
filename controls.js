document.addEventListener('keydown', pressKey);
document.addEventListener('keyup', releaseKey);

const keyPressed = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false
};

function pressKey(e)
{
    const key = e.code;
    switch(key)
    {
        case 'ArrowDown':
        case 'KeyS':

            keyPressed.down = true;

            break;

        case 'ArrowUp':
        case 'KeyW':

            keyPressed.up = true;

            break;

        case 'ArrowLeft':
        case 'KeyA':

            keyPressed.left = true;

            break;

        case 'ArrowRight':
        case 'KeyD':

            keyPressed.right = true;

            break;

        case 'Space':
        case 'Enter':

            keyPressed.fire = true;

            break;
    }
}

function releaseKey(e)
{
    const key = e.code;
    switch(key)
    {
        case 'ArrowDown':
        case 'KeyS':

            keyPressed.down = false;

            break;

        case 'ArrowUp':
        case 'KeyW':

            keyPressed.up = false;

            break;

        case 'ArrowLeft':
        case 'KeyA':

            keyPressed.left = false;

            break;

        case 'ArrowRight':
        case 'KeyD':

            keyPressed.right = false;

            break;

        case 'Space':
        case 'Enter':

            keyPressed.fire = false;

            break;
    }
}