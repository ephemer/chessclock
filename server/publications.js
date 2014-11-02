Meteor.publish('games', function (gameName) {
	return Games.find({
		$or: [	{_id: gameName},
				{gameName: gameName}  ]
	});
});