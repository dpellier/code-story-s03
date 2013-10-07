
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Routing
 */

app.get('/reset', routes.reset);
app.get('/call', routes.call);
app.get('/go', routes.go);
app.get('/userHasEntered', routes.userHasEntered);
app.get('/userHasExited', routes.userHasExited);

app.get('/nextCommand', routes.nextCommand);

app.get('/switchDebugMode', routes.switchDebugMode);

/**
 * Start server
 */

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
