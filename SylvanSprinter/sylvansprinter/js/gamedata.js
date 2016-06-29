( function()
{
    // Background layer data
    var terrainTextures = [
        // Layer behind everything - first rendered
        {
            scrollMultiplier: 0.5,
            textures:
            [
                'res/art/Forest_BackTrees.png'
            ],
            bgOffset: 0
        },
        {
            scrollMultiplier: 0.7,
            textures:
            [
                'res/art/Forest_Clouds.png'
            ],
            bgOffset: 0
        },
        // Foremost background layer
        {
            scrollMultiplier: 1,
            textures:
            [
                // These textures are rendered in order
                'res/art/Forest_MidGrass.png',
                'res/art/Forest_MidDirt.png',
                'res/art/Forest_MidTrees.png'
            ],
            bgOffset: 0
        },
    ];

    // Sprite definitions
    // These are defined as functions to return a new sprite every time one is requested
    var sprites =
    {
        character: function()
        {
            return new Sprite( 'res/art/ElfSpriteSheet.png', [0, 0], [180, 180], [1, 1],
               [
                   [6, 7, 8, 9], // run
                   [14, 14, 14, 15, 16, 17], // jump
                   [22, 23, 24, 25, 26, 27, 28] // die
               ],
               'vertical', false );
        },

        arms: function()
        {
            return new Sprite( 'res/art/ElfSpriteSheet.png', [0, 0], [180, 180], [1, 1],
            [
                [10, 11, 12, 13], // idle
                [18, 19, 20, 21] // sword
            ],
            'vertical' );
        },

        stump: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [502, 566], [276, 213], [0.70, 0.70] );
        },

        stone: function()
        {
            return new Sprite( 'res/art/StoneColumnSpriteSheet.png', [0, 0], [250, 250], [1, 1],
                [
                    [0], // normal
                    [1, 2, 3, 4, 5, 6] //break
                ],
                'vertical' );
        },

        stone2: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [267,536], [235,127] );
        },

        tree1: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [0, 0], [372, 536] );
        },

        tree2: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [520, 0], [131, 536] );
        },

        tree3: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [651, 0], [201, 536] );
        },

        tree4: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [852, 0], [172, 509] );
        },

        bush1: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [372, 289], [148, 65] );
        },

        bush2: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [769, 795], [241, 105] );
        },

        fern1: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [813, 692], [167, 103] );
        },

        fern2: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [840, 900], [158, 104] );
        },

        thorns: function()
        {
            return new Sprite( 'res/art/environmentalAssets.png', [267, 663], [235, 122] );
        },
    };

    // Obstacle types
    // These are used to define the obstacle hitboxes in relation to sprites, as well as their interactions when attacked
    var obstacleTypes = [
        {
            obsType: "stump",
            offset: [42, 30],
            verticalPos: -90,
            size: [85, 200],
            sprite: sprites.stump
        },
        {
            obsType: "stone",
            offset: [105, 55],
            verticalPos: -10,
            size: [70, 190],
            sprite: sprites.stone
        },
        {
            obsType: "rock",
            offset: [15, 55],
            verticalPos: -10,
            size: [205, 65],
            sprite: sprites.stone2
        }
    ];

    // Foreground sprite data
    var foregroundTypes = [
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [372, 536],
            sprite: sprites.tree1
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [131, 536],
            sprite: sprites.tree2
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [201, 536],
            sprite: sprites.tree3
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [172, 509],
            sprite: sprites.tree4
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [148, 65],
            sprite: sprites.bush1
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [241, 105],
            sprite: sprites.bush2
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [167, 103],
            sprite: sprites.fern1
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [158, 104],
            sprite: sprites.fern2
        },
        {
            offset: [0, 0],
            verticalPos: -10,
            size: [235, 122],
            sprite: sprites.thorns
        }
    ];

    function loadResources(callback)
    {
        resources.load( [
            { url: 'res/art/Forest_BackTrees.png', resType: Image },
            { url: 'res/art/Forest_Clouds.png', resType: Image },
            { url: 'res/art/Forest_MidDirt.png', resType: Image },
            { url: 'res/art/Forest_MidGrass.png', resType: Image },
            { url: 'res/art/Forest_MidTrees.png', resType: Image },
            { url: 'res/art/environmentalAssets.png', resType: Image },
            { url: 'res/art/ElfSpriteSheet.png', resType: Image },
            { url: 'res/art/StoneColumnSpriteSheet.png', resType: Image },
            { url: 'res/audio/death_1.mp3', resType: Audio },
            { url: 'res/audio/jump_1.mp3', resType: Audio },
            { url: 'res/audio/land_1.mp3', resType: Audio },
            { url: 'res/audio/stone_break_1.mp3', resType: Audio },
            { url: 'res/audio/sword_swing_1.mp3', resType: Audio },
        ] );
        resources.setOnReady( callback );
    }

    // Set all this data to be accessible from other scripts on the window
    window.gamedata =
    {
        terrainTextures: terrainTextures,
        sprites: sprites,
        obstacleTypes: obstacleTypes,
        foregroundTypes: foregroundTypes,
        loadResources: loadResources
    };
} )();