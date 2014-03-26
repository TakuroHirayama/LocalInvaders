var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var areaSchema = new Schema({
    position : {
        latitude : Number,
        longitude : Number,
        radius : Number
    },
    date : {
        "type" : Date,
        "default" : Date.now
    }
});
areaSchema.methods.foo = function() {
    console.log("foo");
};
//クラスメソッド
areaSchema.static.bar = function() {
    console.log("bar");
};
mongoose.model('Area', areaSchema);
exports.Area = mongoose.model("Area");
