# Jsonfig - A simple and flexible configuration loader.

In your main application - setup as follows:
```sh
var jsonfig = require('jsonfig');

var config = jsonfig.setup('root')
    .lookInEnvironment()                              // Environment overrides all.
    .lookInFile('./env_specific_config.json')         // Then look in here.
    .lookInFile('./distributed_default_config.json'); // Etc...
    
    jsonfig.setLogginFunction   // Optionally tell jsonfig where to log.
        ('warn', myFavouriteLogger.warn)
        ('info', myFavouriteLogger.info);
    
var dbHost = config.getValue('database-host-name');
```

Now, assuming we have a shared library whos config is overrideable by the main application.

```sh
var config = jsonfig.setup('module1')
    .lookInConfig('root')                 // Find and use the config specified above.
    .lookInFile('./module1-config.json'); // Look here if key isn't found in above.

var dbHost = config.getValue('database-host-name');
```

