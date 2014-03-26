var Player = require('../models/Player').Player;
var mongoose = require('mongoose');
var start_game = require('../lib/share').getStartGame();
const MAX_PLAYER_COUNT = 4;

exports.title = function(req, res) {
    if (req.session.player_id) {
        res.redirect("/room");
    } else {
        res.render('title');
    }
};

exports.titlePost = function(req, res) {
    Player.count({}, function(err, count) {
        if (err) {
            console.error(err);
            res.render('title', {
                error : "うんち漏れた"
            });
        } else if (count > MAX_PLAYER_COUNT) {
            //悪いなのび太。このゲーム、4人用なんだ（システム全体で）。
            res.render('title', {
                error : "悪いなのび太。このゲーム、4人用なんだ。"
            });
        } else {
            //名前を必須にしよう
            var playername = req.body.playername;
            if (playername) {
                var player = new Player({
                    name : playername,
                    player_id : ++count
                });
                player.save(function(err, inserted) {
                    if (err) {
                        res.render('title', {
                            error : "うんち漏れた"
                        });
                        console.error(err);
                    } else {
                        req.session.name = inserted.get("name");
                        req.session.player_id = inserted.get("player_id");
                        res.redirect('/room');
                        return;
                    }
                });
            } else {
                res.render('title', {
                    error : "名前入れろって言ってんのわかんねーのか。目ん玉ほじくり返してよく見ろ、カスが。"
                });
            }
        }
    });
};

exports.room = function(req, res) {
    //名前入力済みか
    if (!req.session.player_id) {
        //遊べないお
        res.redirect("/");
        return;
    }
    //自分含めての最新ユーザ3人をdate降順で
    Player.find({}).sort("-date").limit(MAX_PLAYER_COUNT).exec(function(err, docs) {
        if (err || docs.length > MAX_PLAYER_COUNT) {
            //遊べないお
            //4人用なんだ
            res.redirect("/");
            return;
        }
        res.render('room', {
            players : docs,
            me : {
                name : req.session.name,
                player_id : req.session.player_id
            }
        });
    });
};

exports.play = function(req, res) {
	Player.find({}).sort("-date").limit(MAX_PLAYER_COUNT).exec(function(err, docs) {
		res.render('play', {
		    player_id:req.session.player_id,
		    name:req.session.name,
            players : docs
        });
	});
};

//管理用のデータベース削除
exports.admin_reset = function(req, res) {
    mongoose.connection.collections['players'].drop(function(err) {
        console.log('players dropped');
    });
    res.redirect("/");
};

exports.logout = function(req, res) {
    if (req.session.player_id) {
        Player.remove({
            player_id : req.session.player_id
        }, function(err) {
            if (!err) {
                req.session.destroy();
            }
            res.redirect("/");
        });
    }
};

exports.result = function(req, res) {
    res.render('result');
};
