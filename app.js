/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//これを追加することで、ページ毎に読み込んでくるroutesの中を分けた
var chat = require('./routes/chatroom');
var geo = require('./routes/gelocation_test');
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
app.get('/chatroom', chat.chatroom);
app.get('/gelocation_test', geo.gelocation_test);
//app.get('/title', title);
//app.post('/title', titlePost);
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
            share.timer = true;
            setTimeout(function() {
                room_socket.emit("S_to_C_game_start");
                //ここでroomからplay画面へ移行する時間を設定(ms)
            }, 3000);
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
 * 2014-3-25
 * 制作：石川
 * play画面でのみ使われるソケット通信
 */
var play_socket = io.of('/play').on('connection', function(socket) {
    socket.on("C_to_S_game_start", function() {
        //次のゲームが始められるようにフラグを折る
        share.timer = false;
        //setTimeout(function(){play_socket.emit("S_to_C_game_end")}, 30000);
        var location = share.new_area();
        play_socket.emit("S_to_C_create_new_area", {
            location : location
        });
    });
    //切断したときに送信
    //connect, message, disconnectは予め用意されているイベント
    socket.on("disconnect", function() {
        //alert("disconnect from server");
        play_socket.emit("S_to_C_message", {
            value : "user disconnected"
        });
    });
});

//========================== LocalInvader/playで行われるソケット通信 終わり==========================

//クライアントからアクションを受け取る窓口
//socketにはクライアントからのアクションが入っている
io.sockets.on("connection", function(socket) {
    //メッセージ送信（送信者にも送られる）
    //C_to_Smessageはイベント名
    socket.on("C_to_S_message", function(data) {
        //自分を含む全ての人に送信
        io.sockets.emit("S_to_C_message", {
            value : data.value
        });
    });

    //ブロードキャスト（送信者以外の全員に送信）
    socket.on("C_to_S_broadcast", function(data) {
        //自分以外の人に送信
        socket.broadcast.emit("S_to_C_message", {
            value : data.value
        });
    });

    //何を打ち込んでも、必ずHelloと返してしまう
    socket.on("C_to_S_hellomessage", function(data) {
        //helloと返すだけ
        //このように表記している理由はクライアントで{value:data}と渡している
        //つまりこっちでは受け取った引数の形(例えば sample_dataなら sample_data.valueに必要なデータが入っている)
        socket.broadcast.emit("S_to_C_message", {
            value : data.value
        });
    });

    //緯度と経度を全てのユーザに伝える
    socket.on("C_to_S_location", function(data) {
        io.sockets.emit("S_to_C_location", data);
    });

    /*
     * 2014-3-24
     * 制作：石川
     * ゲーム画面へ移動するレスポンスを全員に投げる
     */
    socket.on("C_to_S_game_start", function() {
        if (share.timer == false) {
            //タイマーをスタートさせる
            share.timer = true;
            console.log("はいりました");
            //以下のような書き方をすると動かなかった
            //setTimeout('io.sockets.emit("S_to_C_game_start")', 10000);
            setTimeout(function() {
                io.sockets.emit("S_to_C_game_start"), {
                    data : express.session.name
                };
            }, 10000);
        } else {
            //タイマーがスタートしているので別の処理に飛ばす
            io.sockets.emit("S_to_C_announceMessage");
        }
    });

    //切断したときに送信
    //connect, message, disconnectは予め用意されているイベント
    socket.on("disconnect", function() {
        //alert("disconnect from server");
        io.sockets.emit("S_to_C_message", {
            value : "user disconnected"
        });
    });
});

//ゲームに関するメッセージング
var game = io.set("heartbeats", true).of("/game");
game.on("connection", function(socket) {
    //参加時の処理
    var sessid = socket.transport.sessid;

    socket.on("locationUpdate", function(data) {
        //位置情報定期更新
        socket.broadcast.emit("locationUpdate", data);
    }).on("newPlayer", function(data, callback) {
        //新規プレイヤー追加
        socket.broadcast.emit("newPlayer", data);
        callback();
    }).on("playerDie", function(data) {
        //プレイヤー死亡
    }).on("newTarget", function(data) {
        //新エリア出現
    }).on("clearTarget", function(data) {
        //エリア消滅
    }).on("disconnect", function() {
        //死亡宣告通知
        socket.broadcast.emit("playerDie", {
            id : sessid
        });
    });
});

