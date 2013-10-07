/**
 * Global variables
 */

// Flag to show all the development logs
var debug = 0;

// All possible commands for the elevator
var commands = {
    nothing: 'NOTHING',
    up: 'UP',
    down: 'DOWN',
    open: 'OPEN',
    close: 'CLOSE'
};

var floors, currentFloor, nbUserIn, doorOpen, forceMove, floorToReached, direction;

function init() {
    floors = {};            // Contain all the command passed to the elevator
    currentFloor = 0;       // Current floor where the elevator stand
    nbUserIn = 0;           // Number of user inside the elevator
    doorOpen = false;       // Flag indicate whether the door is open or not
    forceMove = false;      // Flag indicate whether the elevator has to move regardless of the calls
    floorToReached = null;  // Farest floor to go before changing direction
    direction = '';         // Elevator direction UP or DOWN
}
init();

/**
 * Define the floor object
 * waiting : number of people waiting at the floor
 * leaveHere : number of people who will left on this floor
 * @constructor
 */
var Floor = function() {
    this.waiting = 0;
    this.leaveHere = 0;
};

/**
 * Events definitions
 */

// Reset the elevator
exports.reset = function(req, res) {
    init();

    console.log('RESET : ' + req.query.cause);
    res.send(200);
};

// Add a request for a floor with destination information
exports.call = function(req, res) {
    var floor = floors[req.query.atFloor] = floors[req.query.atFloor] || new Floor();
    floor.waiting++;

    res.send(200);
};

// Add a request to go to a specific floor
exports.go = function(req, res) {
    var floor = floors[req.query.floorToGo] = floors[req.query.floorToGo] || new Floor();
    floor.leaveHere++;

    res.send(200);
};

// Indicate that a user has come in the elevator
exports.userHasEntered = function(req, res) {
    nbUserIn++;
    floors[currentFloor].waiting--;

    log('Quelqu\'un monte');
    res.send(200);
};

// Indicate that a user has left the elevator
exports.userHasExited = function(req, res) {
    nbUserIn--;
    floors[currentFloor].leaveHere--;

    log('Quelqu\'un descend');
    res.send(200);
};

/**
 * Commands definitions
 */

exports.nextCommand = function(req, res) {

    /**
     * Get / drop management
     */
    log('Current : ' + currentFloor + ' - to reached ' + floorToReached);
    log('User in : ' + nbUserIn);

    if (currentFloor == floorToReached) {
        floorToReached = null;
    }

    if (Object.keys(floors).length) {
        if (forceMove) {
            forceMove = false;

            log('On me force à bouger');
            log(floors);

            move();
        } else {
            if (floors[currentFloor]) {
                if (!doorOpen) {
                    open();
                } else {
                    if (floors[currentFloor].leaveHere) {
                        log('Je ne fais rien car je suis encore plein');
                        nothing();
                    } else {
                        if (floors[currentFloor].waiting) {
                            log('Je ne fais rien car tout le monde n\'est pas monté');
                            nothing();
                        } else {
                            forceMove = true;
                            delete floors[currentFloor];
                            close();
                        }
                    }
                }
            } else {
                log('Je bouge');
                log(floors);

                move();
            }
        }
    } else {
        log('Je ne fais rien car je n\'ai rien à faire');
        nothing();
    }


    /**
     * Movement management
     */

    function move() {
        if (floorToReached == null) {
            floorToReached = getFarest();
            direction = (floorToReached < currentFloor ? commands.down : commands.up) || ''
        }
        log('Direction : ' + direction);

        switch (direction) {
            case commands.up: up();
                break;
            case commands.down: down();
                break;
            default: nothing();
        }
    }

    // Find the farest key from currentFloor
    function getFarest() {
        var farest = Object.keys(floors)[0];
        var firstDistance = Math.abs(farest - currentFloor);

        for (var floor in floors) {
            if (Math.abs(floor - currentFloor) > firstDistance) {
                farest = floor;
            }
        }

        return farest;
    }

    /**
     * Command response
     */

    function open() {
        log('Je m\'ouvre');
        doorOpen = true;
        res.send(200, commands.open);
    }

    function close() {
        log('Je me ferme');
        doorOpen = false;
        res.send(200, commands.close);
    }

    function up() {
        log('Je monte');
        currentFloor++;
        res.send(200, commands.up);
    }

    function down() {
        log('Je descends');
        currentFloor--;
        res.send(200, commands.down);
    }

    function nothing() {
        res.send(200, commands.nothing);
    }
};

/**
 * Logging function
 * @param toLog
 */
var log = function(toLog) {
    if (debug) {
        console.log(toLog);
    }
};

exports.switchDebugMode = function(req, res) {
    debug = req.query.debug || 0;
    res.send(200);
};