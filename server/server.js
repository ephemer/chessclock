Meteor.methods({
  "changePlayer": function (_id) {
    var game = Games.findOne(_id);
    if(!game) throw Meteor.Error("Cannot find game with that _id");

    var newData = {};

    // increment current player's time
    var timeSinceLastTurn = moment().diff(game.lastTurn); // difference between now and lastTurn
    
    newData["playerTimes." + game.currentPlayer] =
      game.playerTimes[game.currentPlayer] + timeSinceLastTurn - game.bonusTime;
    
    // toggle current player
    newData.currentPlayer = +!game.currentPlayer // toggle between 1 and 0
    
    // update lastTurn (to now)
    newData.lastTurn = new Date();

    Games.update(_id, {$set: newData});
  }
});