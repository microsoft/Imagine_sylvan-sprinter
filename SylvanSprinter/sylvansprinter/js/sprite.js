( function ()
{
    // Sprite constructor
    function Sprite( path, pos, size, scale, anims, dir )
    {
        this.pos = pos; // Position of sprite on the loaded image
        this.size = size; // Size of sprite on loaded image
        this.scale = scale || [1, 1]; // Default scale is 1
        this.speed = 0; // Frames per second -- don't play anything until requested
        this.anims = anims; // Array of arrays of frame data for animations
        this.animIndex = 0; // Index of which animation to play
        this._index = 0; // frame index
        this.path = path; // Path to image
        this.dir = dir || 'vertical'; // Direction of the sprite sheet (horizontal or vertical)
        this.loop = false; // Default sprite behaviour is not to loop until an animation is requested
    };

    Sprite.prototype = {
        // Play an animation on this sprite
        playAnim: function ( animIndex, loop, speed )
        {
            this.animIndex = animIndex;
            this.speed = typeof speed === 'number' ? speed : 10; // Default 10 frames per second
            this._index = 0;
            this.loop = loop;
            this.done = false;
        },

        // Update frame index
        update: function ( dt )
        {
            this._index += this.speed * dt;
        },

        // Render the sprite
        render: function ( ctx )
        {
            var frame;

            // If an animation is playing, select the correct frame
            if ( this.speed > 0 )
            {
                var max = this.anims[this.animIndex].length;
                var idx = Math.floor( this._index );

                // Check if we're done the animation
                if ( ( !this.loop ) && idx >= max )
                {
                    this.done = true;
                }

                // If we're done then grab the last frame
                if ( this.done )
                {
                    frame = this.anims[this.animIndex][max - 1];
                }
                // Otherwise grab whichever frame we're on
                else
                {
                    frame = this.anims[this.animIndex][idx % max];
                }
            }
            // If there is animation data but the speed is 0, grab the first frame of the current animation
            else if ( this.anims )
            {
                frame = this.anims[this.animIndex][0];
            }
            // Grab the first frame otherwise
            else
            {
                frame = 0;
            }

            var x = this.pos[0];
            var y = this.pos[1];

            // Get the frame position in the image
            if ( this.dir == 'vertical' )
            {
                y += frame * this.size[1];
            }
            else
            {
                x += frame * this.size[0];
            }

            // Draw the frame on the canvas
            ctx.drawImage( resources.get( this.path ),
                           x, y,
                           this.size[0], this.size[1],
                           0, 0,
                           this.size[0] * this.scale[0], this.size[1] * this.scale[1] );
        }
    };

    // Hook the constructor into the window to allow other scripts to use it
    window.Sprite = Sprite;
} )();