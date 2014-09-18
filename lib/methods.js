Meteor.methods({
  createGame: function (game) {

    // Format the input we received into something workable
    _.extend(game, {
      gameLength: timeify(game.gameLength),
      bonusTime: timeify(game.bonusTime),
      // remove any empty strings so defaults can take over
      playerName1: game.playerName1 || undefined,
      playerName2: game.playerName2 || undefined,
      gameName: _.slugify(game.gameName) || undefined,
    });

    // Add any values that didn't come through in the method call
    _.defaults(game, {
      gameLength: timeify("15:00"),
      gameName: Meteor.uuid(),
      bonusTime: timeify("0:05"),
      currentPlayer: 0,
      lastTurn: new Date(),
      playerTimes: [0, 0], // in ms
    });

    // Game names must be unique, our sharable url depends on it
    if ( Games.findOne({gameName: game.gameName}) ){
      throw new Meteor.Error('A game with that name already exists!');
    }
    
    return Games.insert(game);
  }
});

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