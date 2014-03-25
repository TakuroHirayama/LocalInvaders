//var fs = require('fs');
var User = require('../models/User').User;

exports.main = function(req, res) {
    //自分含めての最新ユーザ3人時間降順
    User.find({}).sort("-date").limit(4).exec(function(err, docs) {
        if (err || docs.length > 3 /*|| !req.session.name*/) {
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
        var user = new User({
            name : postData.name
        });
        user.save(function(err, product) {
            if (!err) {
                req.session.id = user._id;
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

// var __validateImageData = function(req) {
// var iconFile = req.files.icon;
// if (!iconFile) {
// return "no image";
// }
// if (iconFile.type != "image/jpeg" && iconFile.type != "image/gif" && iconFile.type != "image/png") {
// return "invalid image type";
// }
// };
// var e = __validateImageData(req);
// if (e) {
// errors.push(e);
// } else {
// var iconFile = req.files.icon;
// var binIcon = fs.readFileSync(iconFile.path);
// var encodedIcon = new Buffer(binIcon).toString("base64");
// var dataUriIcon = "data:" + iconFile.type + ";base64," + encodedIcon;
// }

