( function ()
{
    let pressedKeys = {};

    // Set/remove key presses based on events
    function setKey( event, status )
    {
        let code = event.keyCode;
        let key;

        switch ( code )
        {
            case 32:
                key = 'SPACE'; break;
            case 37:
                key = 'LEFT'; break;
            case 38:
                key = 'UP'; break;
            case 39:
                key = 'RIGHT'; break;
            case 40:
                key = 'DOWN'; break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode( code );
        }

        pressedKeys[key] = status;
    }

    // Add a keydown listener to set the key press state
    document.addEventListener( 'keydown', function ( e )
    {
        setKey( e, true );
    } );

    // Add a keyup listener to remove the key press state
    document.addEventListener( 'keyup', function ( e )
    {
        setKey( e, false );
    } );

    // Add a blur listener to remove all pressed keys when focus is lost
    window.addEventListener( 'blur', function ()
    {
        pressedKeys = {};
    } );

    window.input = {
        // Add input.isDown to the window to check inputs
        isDown: function ( key )
        {
            return pressedKeys[key.toUpperCase()];
        }
    };
} )();