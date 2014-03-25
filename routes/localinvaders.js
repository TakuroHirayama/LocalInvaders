//ただtitle.ejsを開けさせているだけ
exports.title = function(req, res){
    res.render('title');
};

//titleで渡されたget要素をroomに渡している
exports.room = function(req, res) {
  var playername = req.query.playername;
  res.render('room', {name: playername});
}

exports.play = function(req, res) {
	res.render('play');
}

exports.result = function(req, res) {
	res.render('result');
}