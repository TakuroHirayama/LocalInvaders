exports.title = function(req, res){
    res.render('title');
};

exports.room = function(req, res) {
  var playername = req.query.playername;
  res.render('room', {name: playername});
}