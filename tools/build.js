var requirejs = require('requirejs');

var config = {
    baseUrl: "../app/js",
    appDir: "../app",
    name: "app",
    dir: "../build",
    mainConfigFile: "../app/js/app.js",
    removeCombined: true
};

requirejs.optimize(config, function(buildResponse) {
    //buildResponse is just a text output of the modules
    //included. Load the built file for the contents.
    //Use config.out to get the optimized file contents.
    var contents = fs.readFileSync(config.out, 'utf8');
}, function(err) {
    //optimization err callback
});
