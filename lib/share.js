//このように書くことで、appでも参照することができる
//play画面へ飛ばすためのタイマーフラグ
exports.timer = false;
//すでにゲームが始まっているかどうかを判定するフラグ
var start_game = false;
exports.setStartGame = function(flag) {
	start_game = flag;
};
exports.getStartGame = function() {
	return start_game;
};

//指定した範囲での乱数を生成する
exports.new_area = function() {
    var latitude = Math.random() * (35.657605 - 35.656707) + 35.656707;
    var longitude = Math.random() * (139.545007 - 139.544643) + 139.544643;
    //中心からの範囲
    var rad = Math.random() * (0.0002 - 0.00001) + 0.00001;
    return {
        location : {
            latitude : latitude,
            longitude : longitude,
            radius : rad
        }
    };
};

exports.distance = function(data1, data2) {
	var lat = data1.latitude - data2.latitude;
	var lon = data1.longitude - data2.longitude;
	var dis = Math.sqrt(Math.pow(lat,2) + Math.pow(lon,2));
	return dis;
}
