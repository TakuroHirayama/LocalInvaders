
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketio = require("socket.io"); //ソケット通信

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//routes/index.jsを見に行っている
app.get('/', routes.index);
app.get('/chatroom', routes.chatroom);
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
 
//2014-3-20これを入れないと、herokuでwebsocketが使えない模様
io.configure(function(){
      io.set('transports', ['xhr-polling']);
          io.set('polling duration', 10);
});

//クライアントからアクションを受け取る窓口
//socketにはクライアントからのアクションが入っている
io.sockets.on("connection", function (socket) {
  // メッセージ送信（送信者にも送られる）
  //C_to_Smessageはイベント名
  socket.on("C_to_S_message", function (data) {
    //自分を含む全ての人に送信
    io.sockets.emit("S_to_C_message", {value:data.value});
  });
 
  // ブロードキャスト（送信者以外の全員に送信）
  socket.on("C_to_S_broadcast", function (data) {
    //自分以外の人に送信
    socket.broadcast.emit("S_to_C_message", {value:data.value});
  });

  //何を打ち込んでも、必ずHelloと返してしまう
  socket.on("C_to_S_hellomessage", function (data) {
    //helloと返すだけ
    socket.broadcast.emit("S_to_C_message", {value:data.value});
  });
 
  // 切断したときに送信
  // connect, message, disconnectは予め用意されているイベント
  socket.on("disconnect", function () {
	  //alert("disconnect from server");
      io.sockets.emit("S_to_C_message", {value:"user disconnected"});
  });
});
