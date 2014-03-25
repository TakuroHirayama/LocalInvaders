
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//これを追加することで、ページ毎に読み込んでくるroutesの中を分けた
var chat = require('./routes/chatroom');
var geo = require('./routes/gelocation_test');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketio = require("socket.io"); //ソケット通信

var app = express();

/*
 * 2014-3-25
 * 制作：石川
 * ページ遷移する際に行う動作を格納
 */
var title  = require('./routes/localinvaders').title;
var room   = require('./routes/localinvaders').room;
var play   = require('./routes/localinvaders').play;
var result = require('./routes/localinvaders').result;

/*
 * 2014-3-24
 * 制作：石川
 * グローバル変数を実現させるためにlib/share.jsというファイルを用意して読み込む
 * これでshare.timerで扱うことができる
 */
var share = require('share');

/*
 * 2014-3-25
 * 制作：石川
 * expressにあるMemoryStoreを利用してセッションもメモリに保存する
 */
var MemoryStore = express.session.MemoryStore
, sessionStore = new MemoryStore();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
/*
 * 2014-3-25
 * 制作：石川
 * セッションを用いるために追加、app.routerよりも前に記述しないとダメなのでここに追加
 */
//引数はパスフレーズ（秘密文字列）
app.use(express.cookieParser("Local"));
//引数はハッシュ化の値と使うstoreを宣言
app.use(express.session({ 
    secret: 'Invaders' 
  , store: sessionStore
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//ここで、指定したURLにアクセスした際にどんな動作を行わせるのかを設定している
app.get('/', routes.index);
app.get('/chatroom', chat.chatroom);
app.get('/gelocation_test', geo.gelocation_test);
app.get('/LocalInvaders/title', title);
app.get('/LocalInvaders/room', room);
app.get('/LocalInvaders/play', play);
app.get('/LocalInvaders/result', result);
app.get('/users', user.list);

//ここでサーバを立ち上げている
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//ここがポイントです
//サーバー実装の前に、エラーハンドリングを記載します。
process.on('uncaughtException', function(err) {
 console.log(err);
});

//サーバとソケットを結びつける
var io = socketio.listen(server);

//========================== LocalInvader/roomで行われるソケット通信==========================
/*
 * 2014-3-25
 * 制作：石川
 * room画面でのみ使われるソケット通信
 */
var room_socket = io.of('/LocalInvaders/room').on('connection', function(socket) {
  //メッセージ送信（送信者にも送られる）
  //C_to_Smessageはイベント名
  socket.on("C_to_S_timer_start", function () {
    if(share.timer == false) {
	  //タイマーをスタートさせる
	  share.timer = true;
	  setTimeout(function(){room_socket.emit("S_to_C_game_start")}, 10000);
	}
  });
  //切断したときに送信
  //connect, message, disconnectは予め用意されているイベント
  socket.on("disconnect", function () {
    //alert("disconnect from server");
	room_socket.emit("S_to_C_message", {value:"user disconnected"});
  });
});

//========================== LocalInvader/roomで行われるソケット通信 終わり==========================

//========================== LocalInvader/playで行われるソケット通信==========================
/*
* 2014-3-25
* 制作：石川
* play画面でのみ使われるソケット通信
*/
var play_socket = io.of('/LocalInvaders/play').on('connection', function(socket) {
  socket.on("C_to_S_game_start", function () {
	//次のゲームが始められるようにフラグを折る
	share.timer = false;
    //setTimeout(function(){play_socket.emit("S_to_C_game_end")}, 30000);
	var location = share.new_area();
    play_socket.emit("S_to_C_create_new_area", {location:location})
  });
  //切断したときに送信
  //connect, message, disconnectは予め用意されているイベント
  socket.on("disconnect", function () {
    //alert("disconnect from server");
	play_socket.emit("S_to_C_message", {value:"user disconnected"});
  });
});

//========================== LocalInvader/playで行われるソケット通信 終わり==========================



//クライアントからアクションを受け取る窓口
//socketにはクライアントからのアクションが入っている
io.sockets.on("connection", function (socket) {
//メッセージ送信（送信者にも送られる）
//C_to_Smessageはイベント名
socket.on("C_to_S_message", function (data) {
//自分を含む全ての人に送信
io.sockets.emit("S_to_C_message", {value:data.value});
});

//ブロードキャスト（送信者以外の全員に送信）
socket.on("C_to_S_broadcast", function (data) {
//自分以外の人に送信
socket.broadcast.emit("S_to_C_message", {value:data.value});
});

//何を打ち込んでも、必ずHelloと返してしまう
socket.on("C_to_S_hellomessage", function (data) {
//helloと返すだけ
//このように表記している理由はクライアントで{value:data}と渡している
//つまりこっちでは受け取った引数の形(例えば sample_dataなら sample_data.valueに必要なデータが入っている)
socket.broadcast.emit("S_to_C_message", {value:data.value});
});

//緯度と経度を全てのユーザに伝える
socket.on("C_to_S_location", function (data) {
  io.sockets.emit("S_to_C_location", data);
});

/*
 * 2014-3-24
 * 制作：石川
 * ゲーム画面へ移動するレスポンスを全員に投げる
 */
socket.on("C_to_S_game_start", function () {
	if(share.timer == false) {
		//タイマーをスタートさせる
		share.timer = true;
		console.log("はいりました");
		//以下のような書き方をすると動かなかった
		//setTimeout('io.sockets.emit("S_to_C_game_start")', 10000);
		setTimeout(function(){io.sockets.emit("S_to_C_game_start"), {data:express.session.name}}, 10000);
	}else{
		//タイマーがスタートしているので別の処理に飛ばす
		io.sockets.emit("S_to_C_announceMessage");
	}
});


//切断したときに送信
//connect, message, disconnectは予め用意されているイベント
socket.on("disconnect", function () {
	  //alert("disconnect from server");
  io.sockets.emit("S_to_C_message", {value:"user disconnected"});
});
});
