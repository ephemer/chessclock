// XXX: add pause/go button
// XXX: pause game when timer below 0:00
// XXX: bool gameEnded, gamePaused
// XXX: styling
// XXX: spacebar to switch turn

Template.game.helpers({
  playerName1: function () {
    return this.playerName1 || "Player 1";
  },
  playerName2: function () {
    return this.playerName2 || "Player 2";
  },
  timeleft: function (obj) {
    var game = Template.currentData();
    if(!game) return;

    var gameLength = game.gameLength;
    var currentPlayer = obj.hash.player - 1;
    var currentPlayerTime = game.playerTimes[currentPlayer];

    if(currentPlayer !== game.currentPlayer){
      // return gamelength - this player's time
      return moment(gameLength - currentPlayerTime).format("m:ss");
    }

    var serverTime = TimeSync.serverTime();
    var timeSinceLastTurn = moment(serverTime).diff(game.lastTurn); // difference between now and last turn
    var millisecondsRemaining = gameLength - timeSinceLastTurn - currentPlayerTime;
    return moment(millisecondsRemaining).format("m:ss");
  }
});


Template.game.events({
  'click button#nextplayer': function () {
    Meteor.call("changePlayer", this._id);
  }
});