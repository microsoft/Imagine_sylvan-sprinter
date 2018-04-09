//----------------------------------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------------------------------

var canvas = null;
var ctx = null;

var startOverlay = null;
var gameOverOverlay = null;

var hitboxDebugCheckbox = null;

var lastTime;
var gameTime = 0;

var score = 0;
var scoreText;

var started = false;
var gameOver = false;
var paused = false;

var lastObstacleDistance = 0;
var lastForegroundDistance = 0;

var jumping = false;
var currentJumpSpeed;

var attacking = false;
var attackTime = 0;

// References to our game entities
var character;
var characterArms;
var obstacles = []; // List of obstacles that we need to update
var foregroundEntities = []; // List of foreground sprites that we need to update

//----------------------------------------------------------------------------------------------------
// Tuning Values
//----------------------------------------------------------------------------------------------------

// Speed-up variables
var timeDilation; // Multiplier for time deltas
var maxDilation = 2.5; // Final multiplier for time deltas
var difficultyRampStart = 10.0; // Time (in seconds) to start ramping dilation
var difficultyRampEnd = 60.0; // Time (in seconds) to finish ramping dilation

// Spacing between obstacles and foreground objects
var distanceBetweenObstacles = 535;
var minDistanceBetweenForeground = 800;
var maxDistanceBetweenForeground = 2000;

// Initial game scrolling speed
var scrollRate = 500;
var foregroundScrollMultiplier = 1.75;

// y position of the floor
var gameFloor = 25;

// Jump physics
var jumpHeight = 133;
var jumpTime = 0.75;
var gravity = -1400.0;
var initialJumpSpeed = ( jumpHeight * 2 / jumpTime ) + ( 0.25 * -gravity * jumpTime );

//----------------------------------------------------------------------------------------------------
// Initialization Functions
//----------------------------------------------------------------------------------------------------

// Initialization logic - this runs once on page load
function init()
{
    // Get the canvas and its 2D context for rendering
    canvas = document.getElementById( "myCanvas" );
    ctx = canvas.getContext( "2d" );

    // Get the overlay to show/hide on game start/game over
    startOverlay = document.getElementById( "startOverlay" );
    gameOverOverlay = document.getElementById( "gameOverOverlay" );
    
    // Get score text to update later
    scoreText = document.getElementById( "txtScore" );

    // Get debug hitbox checkbox
    hitboxDebugCheckbox = document.getElementById( "debugHitbox" );

    // Initialize terrain patterns for rendering
    for ( var i = 0; i < gamedata.terrainTextures.length; ++i )
    {
        gamedata.terrainTextures[i].terrainPatterns = [];
        for ( var j = 0; j < gamedata.terrainTextures[i].textures.length; ++j )
        {
            var pattern = ctx.createPattern( resources.get( gamedata.terrainTextures[i].textures[j] ), "repeat" );
            gamedata.terrainTextures[i].terrainPatterns.push( pattern );
        }
    }

    // Character and arms will always be in-game, create them now
    character = new Entity( 110, gameFloor, 80, 60, 28, 105, gamedata.sprites.character(), "green" );
    characterArms = new Entity( 142, gameFloor + 36, 112, 54, 68, 75, gamedata.sprites.arms(), "red" );

    // Set game to initial state
    reset();

    // Run game
    main();
}

// Logic to reset the game to an initial state.
function reset()
{
    bgOffset = 0.0;

    lastTime = Date.now();
    gameTime = 0;
    timeDilation = 1.0;

    score = 0;

    // Reset character
    jumping = false;
    attacking = false;
    character.pos[1] = gameFloor;
    character.sprite.playAnim( 0, true );
    characterArms.sprite.playAnim( 0, true );

    // Reset other objects
    obstacles = [];
    foregroundEntities = [];
    lastObstacleDistance = 0;
    lastForegroundDistance = Math.random() * ( maxDistanceBetweenForeground - minDistanceBetweenForeground );

    // Only hide overlay if the game has started
    if ( started )
    {
        startOverlay.style.display = 'none';
        gameOverOverlay.style.display = 'none';
    }

    gameOver = false;
}

//----------------------------------------------------------------------------------------------------
// Creation Functions
//----------------------------------------------------------------------------------------------------

// Logic to add obstacles to the level
function addObstacle() {
    // Set obstacle to spawn off the right side of the screen
    var initialPositionX = canvas.width + 50;

    // Pick a random obstacle
    var random = gamedata.obstacleTypes[Math.floor(Math.random() *
        gamedata.obstacleTypes.length)];

    // Add a new obstacle of the type from the list
    var obstacle = new Entity(initialPositionX, gameFloor +
        random.verticalPos, random.offset[0], random.offset[1], random.size[0],
        random.size[1], random.sprite(), "yellow");


    obstacle.obsType = random.obsType;
    obstacle.broken = false; //Obstacles only break when player breaks them
    obstacles.push(obstacle);
}

// Logic to add a new foreground art piece
function addForegroundEntity()
{
    // Set foreground object to spawn off the right side of the screen
    var initialPositionX = canvas.width + 50;

    // Pick a random one
    var random = gamedata.foregroundTypes[Math.floor( Math.random() * gamedata.foregroundTypes.length )];

    // Add it to the list
    foregroundEntities.push( new Entity( initialPositionX, random.verticalPos, random.offset[0], random.offset[1], random.size[0], random.size[1], random.sprite() ) );
}

//----------------------------------------------------------------------------------------------------
// Main Loop
//----------------------------------------------------------------------------------------------------

// Main game loop - everything runs from here
function main()
{
    // Calculate a time delta since last tick
    var now = Date.now();
    var dt = ( now - lastTime ) / 1000.0;

    // Only update if not paused
    if ( !paused )
    {
        update( dt );
        render();
    }

    lastTime = now;

    // Tell the browser that we want to call main() again when we're done rendering this frame
    requestAnimFrame( main );
};

//----------------------------------------------------------------------------------------------------
// Update Functions
//----------------------------------------------------------------------------------------------------

function update( dt )
{
    // Only handle input until started
    if ( !started )
    {
        handleInput();
        return;
    }

    // Handle input and animate character on game over
    if ( gameOver )
    {
        handleInput();
        updateJump(dt);

        // Death animation needs to play
        character.sprite.update( dt );
        return;
    }
    
    // Update score
    score += dt * 1000;
    scoreText.innerHTML = "Score: " + score;
    
    // Figure out the speed ramp based on game time
    gameTime += dt;
    if (gameTime > difficultyRampStart && gameTime <= difficultyRampEnd) {
        // 0 to 100 difficulty from start to end time
        percentDifficulty = (gameTime - difficultyRampStart) / (difficultyRampEnd - difficultyRampStart);
        timeDilation = 1.0 + (percentDifficulty * (maxDilation - 1.0));
        timeDilation = Math.min(maxDilation, timeDilation);
    }
    else if (gameTime > difficultyRampEnd)
    {
        timeDilation = maxDilation;
    }
    // Calculate new delta time
    var dilatedTime = timeDilation * dt;

    // Process input
    handleInput();

    // Update background
    updateBackground( dilatedTime );

	// Update character
	updateCharacter( dilatedTime, dt );

    // Update other objects
    updateObstacles( dilatedTime );
    updateForeground( dilatedTime );

    // Check for collisions AFTER updates are done
    checkCollisions();
}

// Input handler. Only handles keyboard inputs.
function handleInput()
{
    // In-game input binding
    if ( !gameOver && started )
    {
        // Jump if not jumping or attacking on SPACE
        if ( input.isDown( 'SPACE' ) && !jumping && !attacking )
        {
            jumping = true;
            currentJumpSpeed = initialJumpSpeed;
            character.sprite.playAnim( 1, false );
            playAudio( 'res/audio/jump_1.mp3' );
        }

        // Attack if not jumping or attacking on RIGHT
        if ( input.isDown( 'RIGHT' ) && !jumping && !attacking )
        {
            attacking = true;
            // Arms need to animate
            characterArms.sprite.playAnim( 1, false, 8 );
            playAudio( 'res/audio/sword_swing_1.mp3' );

            // 0.5 second attack time
            attackTime = 0.5;
        }
    }
    // game over input binding
    else if ( started )
    {
        // R to restart
        if ( input.isDown( 'R' ) )
        {
            reset();
        }
    }
    // Pre-game start input binding
    else
    {
        // R to begin
        if ( input.isDown( 'R' ) )
        {
            started = true;
            startOverlay.style.display = 'none';
            gameOverOverlay.style.display = 'none';
        }
    }
}

// Logic to update background offsets
function updateBackground( dt )
{
    // Loop through background layers
    for ( var i = 0; i < gamedata.terrainTextures.length; ++i )
    {
        var tex = gamedata.terrainTextures[i];
        // Move layer over based on time delta
        tex.bgOffset = tex.bgOffset + ( dt * scrollRate * tex.scrollMultiplier );

        // Loop the texture - don't scroll it to infinity
        if ( tex.bgOffset > canvas.width )
        {
            tex.bgOffset -= canvas.width;
        }
    }
}

// Logic to update the character
function updateCharacter( dilatedTime, dt )
{
    // Update jump state
    if ( jumping )
    {
        updateJump( dilatedTime );
    }

    // Update attacking state
    if ( attacking )
    {
        updateAttack( dilatedTime );
    }

    // Update character sprites
    character.sprite.update( dt );
    characterArms.sprite.update( dt );
}

// Logic to update jump physics
function updateJump( dt )
{
    // Physics update based on kinematic equations:
    //
    //  displacement = (velocity * time) + (0.5 * acceleration * time squared)
    //  final velocity = velocity + (acceleration * time)

    // Vertical positon update
    character.pos[1] += ( currentJumpSpeed * dt );
    character.pos[1] += ( 0.5 * gravity * dt * dt );

    // Jump speed update
    currentJumpSpeed += ( gravity * dt );

    // Stop the character from going through the floor on descent
    if ( character.pos[1] < gameFloor )
    {
        // Snap character to floor and stop jumping
        jumping = false;
        character.pos[1] = gameFloor;

        if (!gameOver)
        {
            // Back to running animation
            character.sprite.playAnim(0, true);
            characterArms.sprite.playAnim(0, true);
            playAudio('res/audio/land_1.mp3');
        }
    }
}

// Logic to update attacking state
function updateAttack( dt )
{
    // Update time left in attack state
    attackTime -= dt;
    if ( attackTime <= 0 )
    {
        attackTime = 0;
        attacking = false;

        // Back to normal running animation
        characterArms.sprite.playAnim( 0, true );
    }
}

// Logic to update obstacle positions
function updateObstacles( dt )
{
    // Distance change
    var delta = scrollRate * dt;

    for ( var i = 0; i < obstacles.length; ++i )
    {
        // Update position
        obstacles[i].pos[0] -= delta;

        // If obstacle is off-screen, remove it
        if ( obstacles[i].pos[0] + obstacles[i].sprite.size[0] < 0 )
        {
            obstacles.splice( i, 1 );
            --i; // We modified the list while looping through it, we need to update the index
            continue;
        }

        // Update sprite
        obstacles[i].sprite.update( dt );
    }

    // Update distance since last obstacle
    lastObstacleDistance -= delta;
    if (lastObstacleDistance <= 0)
    {
        //Instantiate new obstacle
        lastObstacleDistance = distanceBetweenObstacles;
        addObstacle();  
    }
}

// Logic to update foreground scrolling
function updateForeground( dt )
{
    // Calculate distance delta
    var delta = scrollRate * dt * foregroundScrollMultiplier;

    // Loop through foreground objects
    for ( var i = 0; i < foregroundEntities.length; ++i )
    {
        foregroundEntities[i].pos[0] -=  delta;

        // If object is off-screen, remove it
        if ( foregroundEntities[i].pos[0] + foregroundEntities[i].sprite.size[0] < 0 )
        {
            foregroundEntities.splice( i, 1 );
            --i; // We modified the list while looping through it, we need to update the index
            continue;
        }

        // Update sprite
        foregroundEntities[i].sprite.update( dt );
    }

    // Update distance since last foreground object
    lastForegroundDistance -= delta;
    if ( lastForegroundDistance <= 0 )
    {
        // We need a new foreground object!
        lastForegroundDistance = minDistanceBetweenForeground + ( Math.random() * ( maxDistanceBetweenForeground - minDistanceBetweenForeground ) );
        addForegroundEntity();
    }
}

//----------------------------------------------------------------------------------------------------
// Collision Functions
//----------------------------------------------------------------------------------------------------

// Logic for updating collisions
function checkCollisions()
{
    // Check all obstacles
    for (var i = 0; i < obstacles.length; ++i)
    {
        var obstacle = obstacles[i];
        // Skip broken obstacles 
        if (obstacle.broken)
        {
            continue;
        }

        // Check collision between player sword swings and stone obstacle
        if (obstacle.obsType == "stone" &&
            attacking &&
            boxCollides(characterArms.pos, characterArms.size, obstacle.pos, obstacle.size)) {
            // Break the obstacle and play its animation
            obstacle.broken = true;
            obstacle.sprite.playAnim(1, false);
            playAudio('res/audio/stone_break_1.mp3');
            continue;
        }
         // Check collision between player and obstacle
        if (boxCollides(character.pos, character.size, obstacle.pos, obstacle.size))
        {

            // Stop jumping
            currentJumpSpeed = 0;

            // Play death animation
            character.sprite.playAnim(2, false);
            playAudio('res/audio/death_1.mp3');

            // Game over!
            startOverlay.style.display = 'none';
            gameOverOverlay.style.display = 'block';
            gameOver = true;
            return;
        
        }


    }
}

// Collision check between two rectangles
function boxCollides(pos1, size1, pos2, size2) {
    var left1 = pos1[0];
    var right1 = pos1[0] + size1[0];
    var top1 = pos1[1] + size1[1];
    var bottom1 = pos1[1];

    var left2 = pos2[0];
    var right2 = pos2[0] + size2[0];
    var top2 = pos2[1] + size2[1];
    var bottom2 = pos2[1];

    if (right1 < left2 || left1 > right2 || top1 < bottom2 || bottom1 > top2) {
        return false;
    }
    return true;
}

//----------------------------------------------------------------------------------------------------
// Render Functions
//----------------------------------------------------------------------------------------------------

// Main render loop
function render()
{
    renderBackground();
    renderObstacles();
    renderCharacter();
    renderForeground();
}

// Background rendering
function renderBackground()
{
    // Loop through layers
    for ( var i = 0; i < gamedata.terrainTextures.length; ++i )
    {
        // Save current canvas transform data
        var bgOffset = gamedata.terrainTextures[i].bgOffset;

        // Saves the state of the current context
        ctx.save();

        // Move canvas to where we want to start rendering the texture
        ctx.translate( -bgOffset, 0 );

        // Loop through textures in layer
        for ( var j = 0; j < gamedata.terrainTextures[i].terrainPatterns.length; ++j )
        {
            // Draw the texture pattern
            ctx.fillStyle = gamedata.terrainTextures[i].terrainPatterns[j];
            ctx.fillRect( bgOffset, 0, canvas.width + bgOffset, canvas.height );
        }

        // Move the canvas back to where it was
        ctx.restore();
    }
}

// Basic entity rendering - used for character, obstacles, and foreground
function renderEntity( entity )
{
    // Saves the state of the current context
    ctx.save();

    // Move the canvas to where the entity is, accounting for the sprite offset
    var positionX = entity.pos[0] - entity.offset[0];
    var positionY = canvas.height - entity.pos[1] - entity.size[1] - entity.offset[1];
    ctx.translate( positionX, positionY );

    // Render the sprite
    entity.sprite.render( ctx );

    if ( entity.hitboxColor && hitboxDebugCheckbox.checked )
    {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = entity.hitboxColor;
        ctx.fillRect( entity.offset[0], entity.offset[1], entity.size[0], entity.size[1] );
        ctx.globalAlpha = 1.0;
    }

    // Move the canvas back to where it was
    ctx.restore();
}

// Logic to render character sprites
function renderCharacter()
{
    // Base character
    renderEntity( character );

    // Arms are part of base character except for while running
    if ( !jumping && !gameOver )
    {
        renderEntity( characterArms );
    }
}

// Logic to render obstacles
function renderObstacles()
{
    // Loop through obstacles
    for ( var i = 0; i < obstacles.length; ++i )
    {
        renderEntity( obstacles[i] );
    }
}

// Logic to render foreground art
function renderForeground()
{
    // Loop through foreground entities
    for ( var i = 0; i < foregroundEntities.length; ++i )
    {
        renderEntity( foregroundEntities[i] );
    }
}

//----------------------------------------------------------------------------------------------------
// Window Callbacks
//----------------------------------------------------------------------------------------------------

// onblur - called when the window loses focus
window.onblur = function ()
{
    paused = true;
};

// onfocus - called when the window regains focus
window.onfocus = function ()
{
    paused = false;
    lastTime = Date.now();
};

// load resources and init when ready
window.onload = function ()
{
    gamedata.loadResources( init );
};