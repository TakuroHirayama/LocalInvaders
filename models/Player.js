var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var playerSchema = new Schema({
    name : {
        type : String,
        required : "名無しの権兵衛"
    },
    player_id : {
        type : Number,
        index : {
            unique : true
        }
    },
    position : {
        latitude : Number,
        longitude : Number,
        accuracy : Number
    },
    icon : String,
    point : Number,
    date : {
        "type" : Date,
        "default" : Date.now
    }
});
//インスタンスメソッド
playerSchema.methods.foo = function() {
    console.log("foo");
};
//クラスメソッド
playerSchema.static.bar = function() {
    console.log("bar");
};
mongoose.model('Player', playerSchema);
exports.Player = mongoose.model("Player");
