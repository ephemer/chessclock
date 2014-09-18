Router.map(function() {
  this.route('home', {
  	path: '/',
  	template: 'setup'
  });

  this.route('game', {
  	path: '/:gameName',
    onBeforeAction: function () {
      // If we're on a route named after the id, switch URL to actual game name
      var gamesWithId = Games.find(this.params.gameName);
      if( gamesWithId.count() ){
        var realGameName = gamesWithId.fetch()[0].gameName;
        Router.go('game', {gameName: realGameName});
      }
    },
  	data: function () {
  		return Games.findOne({gameName: this.params.gameName});
  	}
  });
});