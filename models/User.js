var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var userSchema = new Schema({
    name : {
        type : String,
        required : "名無しの権兵衛"
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
userSchema.methods.foo = function() {
    console.log("foo");
};
//クラスメソッド
userSchema.static.bar = function() {
    console.log("bar");
};
mongoose.model('User', userSchema);
exports.User = mongoose.model("User");
