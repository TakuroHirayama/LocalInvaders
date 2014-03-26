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
    var rad = Math.random() * 0.02 + 0.05;
    var id = Math.random();
    return {
        latitude : latitude,
        longitude : longitude,
        radius : rad,
        id : id
    };
};

//地球の半径
var earth_r = 6378.137;
//緯度と経度から二点間の距離（km）を出すプログラム
exports.distance = function(data1, data2) {
	var rad_lat = (data1.latitude - data2.latitude) * Math.PI / 180;
	var rad_lon = (data1.longitude - data2.longitude) * Math.PI / 180;
	//緯度差を用いて南北距離を出す
	var nanbokuKyori = earth_r * rad_lat;
	//東西の距離
	var touzaiKyori = Math.cos(data1.latitude * Math.PI / 180) * earth_r * rad_lon;
	var dis = Math.sqrt(Math.pow(touzaiKyori,2) + Math.pow(nanbokuKyori,2));
    return dis;
};
