/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//これを追加することで、ページ毎に読み込んでくるroutesの中を分けた
var user = require('./routes/user');
var game = require('./routes/game');
var http = require('http');
var path = require('path');
var socketio = require("socket.io");
var mongoose = require('mongoose');

var app = express();

/*
 * 2014-3-25
 * 制作：石川
 * ページ遷移する際に行う動作を格納
 */
var title = require('./routes/localinvaders').title;
var titlePost = require('./routes/localinvaders').titlePost;
var room = require('./routes/localinvaders').room;
var play = require('./routes/localinvaders').play;
var admin_reset = require('./routes/localinvaders').admin_reset;
var logout = require('./routes/localinvaders').logout;
var result = require('./routes/localinvaders').result;
/*
 * 2014-3-24
 * 制作：石川
 * グローバル変数を実現させるためにlib/share.jsというファイルを用意して読み込む
 * これでshare.timerで扱うことができる
 */
var share = require('lib/share');

var Area = require('models/Area').Area;

//mongodb接続
mongoose.connect('mongodb://uec_death:localinvadorsdeathyo@oceanic.mongohq.com:10054/local_invader', function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({
    uploadDir : "./uploads"
}));
app.use(express.methodOverride());

/*
 * 2014-3-25
 * 制作：石川
 * expressにあるMemoryStoreを利用してセッションもメモリに保存する
 */
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
//mongodbをsessionのバックエンドにする＝＞どっちでもええ
// var MongoStore = require('connect-mongo')(express);
// var sessionStore = new MongoStore({
// db : 'local_invader',
// host : 'oceanic.mongohq.com',
// port : 10054,
// username : 'uec_death',
// password : 'localinvadorsdeathyo'
// });

/*
* 2014-3-25
* 制作：石川
* セッションを用いるために追加、app.routerよりも前に記述しないとダメなのでここに追加
*/
//引数はパスフレーズ（秘密文字列）
app.use(express.cookieParser("secretdeathyo"));
//引数はハッシュ化の値と使うstoreを宣言
app.use(express.session({
    key : 'sid',
    secret : 'secretdeathyo',
    store : sessionStore
}));

app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//routes/index.jsを見に行っている
app.get('/', title);
app.post('/', titlePost);
app.get('/room', room);
app.get('/play', play);
app.get('/result', result);
app.get('/users', user.list);
app.get('/logout', logout);
app.get('/admin/reset', admin_reset);

//ここでサーバを立ち上げている
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

//ここがポイントです
//サーバー実装の前に、エラーハンドリングを記載します。
process.on('uncaughtException', function(err) {
    console.log(err);
});

//サーバとソケットを結びつける
var io = socketio.listen(server);
var area;
//========================== LocalInvader/roomで行われるソケット通信==========================
/*
 * 2014-3-25
 * 制作：石川
 * room画面でのみ使われるソケット通信
 */
var room_socket = io.of('/room').on('connection', function(socket) {
    //メッセージ送信（送信者にも送られる）
    //C_to_Smessageはイベント名
    socket.on("C_to_S_timer_start", function() {
        if (share.timer == false) {
            //タイマーをスタートさせる
        	console.log("入った");
            share.timer = true;
            setTimeout(function() {
                area = share.new_area();
                // area = new Area(location);
                // area.save(function(err, area) {
                // //次のゲームが始められるようにフラグを折る
                // });
                share.timer = false;
                share.setStartGame(true);
                room_socket.emit("S_to_C_game_start");
                //ここでroomからplay画面へ移行する時間を設定(ms)
            }, 30000);
        }
    });
    //切断したときに送信
    //connect, message, disconnectは予め用意されているイベント
    socket.on("disconnect", function() {
        //alert("disconnect from server");
        room_socket.emit("S_to_C_message", {
            value : "user disconnected"
        });
    });
});

//========================== LocalInvader/roomで行われるソケット通信 終わり==========================

//========================== LocalInvader/playで行われるソケット通信==========================
/*
* 2014-3-26
* 制作：石川,hiraro
* play画面でのみ使われるソケット通信
*/

//ゲームに関するメッセージング
var game = io.set("heartbeats", true).of("/play");
game.on("connection", function(socket) {
    //参加時の処理
    socket.on("locationUpdate", function(data) {
        //位置情報定期更新
        //ここでエリア攻略判定する
        console.log(area);
        if (area.radius > share.distance(area, data)) {
            //新しいエリアを生成
            area = share.new_area();
            //はいってたら新規エリア作成ー＞emit
            socket.emit("newArea", area);
        }
        socket.broadcast.emit("locationUpdate", data);
    }).on("newPlayer", function(data, callback) {
        socket.set("player_id", data.id, function() {
            //新規プレイヤー追加
            socket.broadcast.emit("newPlayer", data);
            //接続時にエリアを返すように…
            callback(area);
        });
    }).on("disconnect", function() {
        //死亡宣告通知
        socket.get('id', function(err, id) {
            socket.broadcast.emit("playerDie", {
                id : id
            });
        });
    });
});
//========================== LocalInvader/playで行われるソケット通信 終わり==========================

