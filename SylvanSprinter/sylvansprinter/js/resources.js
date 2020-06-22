( function ()
{
    let resources = {};
    let readyCallbacks = [];

    // Load an resource URL or an array of URLs
    function load( urlOrArr )
    {
        if ( urlOrArr instanceof Array )
        {
            urlOrArr.forEach( function ( res )
            {
                loadResource( res.url, res.resType );
            } );
        }
        else
        {
            loadResource( urlOrArr );
        }
    }

    // Internal load function - loads an image
    function loadResource( url, resType )
    {
        // Return cached resource if we already loaded it
        if ( resources[url] )
        {
            return resources[url];
        }
        // Otherwise do the load from file
        else
        {
            let res;

            if ( resType )
            {
                res = new resType();
            }
            else
            {
                res = new Image();
            }

            let loadCB = function ()
            {
                resources[url] = res;

                // Check all load calls to see if everything is ready
                if ( isLoaded() )
                {
                    // Call all callbacks
                    readyCallbacks.forEach( function ( func ) { func(); } );
                    readyCallbacks = [];
                }
            };

            // Set state to not loaded
            resources[url] = false;

            if ( res instanceof HTMLAudioElement )
            {
                // Consider audio loaded when the browser thinks it's buffered enough
                res.addEventListener( "canplaythrough", loadCB );
            }
            else
            {
                res.onload = loadCB;
            }

            res.src = url;
        }
    }

    // Return cached image
    function get( url )
    {
        return resources[url];
    }

    // Check all resource loads to see if they're finished
    function isLoaded()
    {
        for ( var k in resources )
        {
            // Check if resource exists and isn't false
            if ( resources.hasOwnProperty( k ) && !resources[k] )
            {
                return false;
            }
        }
        return true;
    }

    // Set a callback for whenever resources are loaded
    function setOnReady( func )
    {
        readyCallbacks.push( func );
    }

    window.resources = {
        load: load,
        get: get,
        setOnReady: setOnReady,
        isLoaded: isLoaded
    };
} )();