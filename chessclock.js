Games = new Meteor.Collection("games");



if (Meteor.isClient) {

  timer = new Tracker.Dependency();

  Template.clock.rendered = function () {
    window.setInterval(function(){
      timer.changed();
    }, 500);
  };


  Template.clock.helpers({
    timeleft: function (obj) {
      var game = Games.findOne();
      if(!game) return;

      timer.depend();
      var gameLength = game.gameLength;
      var currentPlayer = obj.hash.player - 1;
      var currentPlayerTime = game.playerTimes[currentPlayer];

      if(currentPlayer !== game.currentPlayer){
        // return gamelength - this player's time
        return moment(gameLength - currentPlayerTime).format("m:ss");
      }

      var timeSinceLastTurn = moment().diff(game.lastTurn); // difference between now and last turn
      var millisecondsRemaining = gameLength - timeSinceLastTurn - currentPlayerTime;
      return moment(millisecondsRemaining).format("m:ss");
    }
  });


  Template.clock.events({
    'click button[data-player]': function (e, tmpl) {
      Meteor.call("changePlayer");
    }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function () {
    if(!Games.find().count()){
      Games.insert({
        gameLength: 15 * 60 * 1000,
        bonusTime: 5 * 1000,
        currentPlayer: 0,
        lastTurn: new Date(),
        playerTimes: [0, 0], // in ms
      });
    }
  });


  Meteor.methods({
    "changePlayer": function() {
      var game = Games.findOne();

      var newData = {};

      // increment current player's time
      var timeSinceLastTurn = moment().diff(game.lastTurn); // difference between now and lastTurn
      newData["playerTimes." + game.currentPlayer] = game.playerTimes[game.currentPlayer] + timeSinceLastTurn - game.bonusTime; // minus bonusTime
      
      // change current player
      newData.currentPlayer = +!game.currentPlayer // switch 0 to 1 and vice-versa
      
      // lastTurn updaten (to now)
      newData.lastTurn = new Date();

      Games.update(game._id, {
        $set: newData
      });
    }
  });
}
