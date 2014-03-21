
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.chatroom = function(req, res){
  res.render('chatroom');
};