Router.route('/', function () {
  	this.render('setup');
});


Router.route('/:gameName', function () {
  // If we're on a route named after the id, switch URL to actual game name
  var gameWithId = Games.find({_id: this.params.gameName}, {reactive: false});

  if( gameWithId.count() ){
    var realGameName = gameWithId.fetch()[0].gameName;
    if (realGameName) {
      return this.redirect('/' + realGameName);
    }
  }
  


  if (this.ready()) {
    var gameData = Games.findOne();
    if (!gameData) return this.redirect('/');
    // Actually render the template with our real data if everything else checks out:
    this.render('game', {data: gameData})
  }


}, {
  name: "game",
  waitOn: function () {
    return Meteor.subscribe('games', this.params.gameName);
  }
});