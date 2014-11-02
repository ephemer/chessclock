var gameInitialState = {
  currentPlayer: 0,
  ended: false,
  lastAction: new Date(),
  paused: true,
  playerTimes: [0, 0], // in ms
};


Meteor.methods({
  "game/create": function (game) {

    _.extend(game, {
      bonusTime: timeify(game.bonusTime || "0:05"),
      gameLength: timeify(game.gameLength || "15:00"),
      // remove any empty strings so defaults can take over
      playerName1: game.playerName1 || undefined,
      playerName2: game.playerName2 || undefined,
      gameName: _.slugify(game.gameName || Meteor.uuid()),
    });

    // Add any values that didn't come through in the method call
    _.defaults(game, gameInitialState);


    // Game names must be unique, our sharable url depends on it
    if ( Games.findOne({gameName: game.gameName}) ){
      throw new Meteor.Error('A game with that name already exists!');
    }
    
    return Games.insert(game);
  },

  "game/ended": function (_id) {
    var game = getGame(_id);
    
    var newData = {
      paused: true,
      ended: true
    };

    Games.update(_id, {
      $set: newData
    });
  },

  "game/playPause": function (_id) {
    
    var game = getGame(_id);
    if(game.ended) return Meteor.call("game/restart", _id);

    var newData = {
      paused: !game.paused,
    };

    if(game.paused){
      newData.lastAction = new Date();
    } else {
      incrementCurrentPlayerTime(game, newData);
    }

    Games.update(_id, {
      $set: newData
    });

  },

  "game/restart": function (_id) {
    var game = getGame(_id);
    Games.update(_id, { $set: gameInitialState });
  },

  "game/switchPlayer": function (_id) {
    var game = getGame(_id);
    var newData = {};

    incrementCurrentPlayerTime(game, newData);
    addTimeBonus(game, newData);

    // toggle current player
    newData.currentPlayer = +!game.currentPlayer // toggle between 1 and 0
    
    // update lastAction (to now)
    newData.lastAction = new Date();

    Games.update(_id, {$set: newData});
  }
});



// -----------------------------------------------------------------------------
// Helpers

function getGame(_id) {  
  
  var game = Games.findOne(_id);
  if(!game) throw Meteor.Error("Cannot find game with that _id");
  
  return game;

}


function timeify (string) {
  // moment.js only accepts durations in the format of "hh:mm:ss"...
  // Most users will put in values of "m:ss", or just "s", so mangle
  // our string into that format & turn it into a millisecond value.


  // If it's not a string or a number, forget about it
  if( ! _(string).isString() && ! _(string).isNumber() ) return undefined;

  // Make sure it really is a string so we can .split() it
  var string = string + "";
  var timeParts = string.split(':');

  if(timeParts.length > 3) throw Meteor.Error("Invalid time given: " + string);
  
  // Keep adding parts onto our string until we have three (h:m:s)
  if(timeParts.length < 3){
    timeParts.unshift("0"); // add a "0:" to the start
    return timeify(timeParts.join(":")); // iterate
  } else {
    // Return the duration in milliseconds
    return +moment.duration(string);
  }
}

function incrementCurrentPlayerTime(game, newData) {
  // Update newData with difference between now and lastAction
  var timeSincelastAction = moment().diff(game.lastAction);
  
  newData["playerTimes." + game.currentPlayer] =
    game.playerTimes[game.currentPlayer] + timeSincelastAction;

}

function addTimeBonus(game, newData) {
  newData["playerTimes." + game.currentPlayer] =
    newData["playerTimes." + game.currentPlayer] - game.bonusTime;
}