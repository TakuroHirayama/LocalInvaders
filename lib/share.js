//このように書くことで、appでも参照することができる
exports.timer = false;
exports.game_started=false;

//指定した範囲での乱数を生成する
exports.new_area = function() {
    var latitude = Math.random() * (35.657605 - 35.656707) + 35.656707;
    var longitude = Math.random() * (139.545007 - 139.544643) + 139.544643;
    var rad = Math.random() * 10;
    return {
        location : {
            latitude : latitude,
            longitude : longitude,
            radius : rad
        }
    };
};