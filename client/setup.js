Template.setup.events({
	'submit form': function (e) {
		e.preventDefault();

		var gameData = {
			gameLength: $("#gameLength").val(),
			bonusTime: $("#bonusTime").val(),
			playerName1: $("#playerName1").val(),
			playerName2: $("#playerName2").val(),
			gameName: $("#gameName").val(),
		};

		Meteor.call("game/create", gameData, function (err, res) {
			if(err) return alert(err);

			// res is actually the game's _id, not its name
			// we fix this in the game route's onBeforeAction
			Router.go("game", {gameName: res});
		});
	}
});