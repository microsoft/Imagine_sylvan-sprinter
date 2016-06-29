( function ()
{
    // Entity constructor. Used by everything but the background.
    function Entity( x, y, offsetX, offsetY, width, height, sprite, hitboxColor )
    {
        this.pos = [x, y];
        this.offset = [offsetX, offsetY]; // empty space on left/top of sprite after scaling
        this.size = [width, height]; // size of hit box
        this.sprite = sprite;
        this.hitboxColor = hitboxColor;
    }

    // Hook the constructor into the window to allow other scripts to use it
    window.Entity = Entity;
} )();