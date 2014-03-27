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

//電通の緯度経度
//var min_lat = 35.656707;
//var max_lat = 35.657605;
//var min_lon = 139.544643;
//var max_lon = 139.545007;

//ミッドタウンの緯度経度
var min_lat = 35.664967;
var max_lat = 35.667264;
var min_lon = 139.728210;
var max_lon = 139.732992;

//指定した範囲での乱数を生成する
exports.new_area = function() {
    var latitude = 1.5*Math.random() * (max_lat - min_lat) + min_lat;
    var longitude = 1.5*Math.random() * (max_lon - min_lon) + min_lon;
    //中心からの範囲
    var radius = Math.random() * 0.02 + 0.01;
    var id = Math.random();
    return {
        latitude : latitude,
        longitude : longitude,
        radius : radius,
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
    var dis = Math.sqrt(Math.pow(touzaiKyori, 2) + Math.pow(nanbokuKyori, 2));
    return dis;
};
