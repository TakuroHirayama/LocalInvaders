var Player = require('../models/Player').Player;
const MAX_PLAYER_COUNT=4;

exports.main = function(req, res) {
    //自分含めての最新ユーザ3人をdate降順で
    Player.find({}).sort("-date").limit(MAX_PLAYER_COUNT).exec(function(err, docs) {
        if (err || docs.length > MAX_PLAYER_COUNT /*|| !req.session.name*/) {
            //遊べないお
            //TODO:エラーページ表示
            res.redirect("/");
        }
        res.render('game_main', {
            players : docs,
            me : {
                name : req.session.name,
                id : req.session.id
            }
        });
    });

};
exports.testForm = function(req, res) {
    res.render('game_form');
};
exports.testFormPost = function(req, res) {
    var errors = [];
    var postData = req.body;
    var e = __validate(req);
    if (e) {
        errors.push(e);
    } else {
        var player = new Player({
            name : postData.name
        });
        player.save(function(err, product) {
            if (!err) {
                req.session.id = player._id;
                req.session.name = product.get("name");
                res.redirect("/game");
                return;
            }
            errors.push(err);
        });
    }
    if (errors.length > 0) {
        res.render('game_form', {
            name : postData.name,
            errors : errors
        });
    }
};
var __validate = function(req) {
    var postData = req.body;
    if (!postData.name) {
        return "no name, f@ck U.";
    }
};
