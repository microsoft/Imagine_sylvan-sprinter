( function ()
{
    // Shim layer with setTimeout fallback
    let requestAnimFrame = ( function ()
    {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function ( callback )
            {
                window.setTimeout( callback, 1000 / 60 );
            };
    } )();

    // Toggle drawing of hitboxes
    function onDebugHitboxChanged()
    {
        // Remove input focus from the checkbox so spacebar doesn't toggle it
        hitboxDebugCheckbox.blur();
    }

    // Audio helper function
    function playAudio( url )
    {
        let audio = resources.get( url );
        audio.pause();
        audio.currentTime = 0;
        audio.play();
    }

    // Hook into the window to allow other scripts to use it
    window.requestAnimFrame = requestAnimFrame;
    window.onDebugHitboxChanged = onDebugHitboxChanged;
    window.playAudio = playAudio;
} )();