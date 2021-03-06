Template.game.helpers({
  active: function (player) {
    // in the template, "player" is 1-indexed
    // whereas game.currentPlayer is 0-indexed:
    player--;
    
    var game = Template.currentData() || {};
    if (player === game.currentPlayer) return 'bg-success';
  },
  
  playerName1: function () {
    return this.playerName1 || "Player 1";
  },

  playerName2: function () {
    return this.playerName2 || "Player 2";
  },

  pausePlayText: function () {
    if(this.ended) return "Restart";
    if(this.paused) return "Play";
    return "Pause";
  },

  timeleft: function (player) {
    var game = Template.currentData();
    if(!game) return;

    player--; // It's 1-indexed
    var gameLength = game.gameLength;
    var playerTime = game.playerTimes[player];


    // Pausing the game is the same as it being neither player's turn
    if( game.paused || player !== game.currentPlayer){
      // return gamelength - this player's time
      return moment(gameLength - playerTime).format("m:ss");
    }

    // don't trust the client's clock time to be accurate
    var now = TimeSync.serverTime();
    var timeSincelastAction = moment(now).diff(game.lastAction);
    var millisecondsRemaining = gameLength - timeSincelastAction - playerTime;
    
    if(millisecondsRemaining <= 0) Meteor.call("game/ended", this._id);

    return moment(millisecondsRemaining).format("m:ss");
  }
});


Template.game.events({
  'click button#nextplayer': function () {
    Meteor.call("game/switchPlayer", this._id);
  },
  'click button#pausePlay': function (e, tmpl) {
    Meteor.call("game/playPause", this._id, function () {
      tmpl.$("button#nextplayer").focus();
    });
  }
});