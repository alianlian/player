var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    config = require('getconfig'),
    bodyParser = require('body-parser');

var mysql = require('mysql');
var TEST_DATABASE = 'backbonetest';//数据库名
var TEST_TABLE = 'todos';//表名
var client = mysql.createConnection({  
      host : 'localhost',  
      user : 'root',  
      password : '123456',
      database: 'backbonetest',
      port: 3306
}); 

/* 启动服务器 */
var port = 4711;

server.listen(port, function () {
    console.log('Server is listening on port' + port);
});

client.connect();

var SELECTBOOKS = 'select * from totos',
    UPDATEBOOK = 'update totos set title = ? where id = ?',
    DELETEBOOK = 'delete from totos where id = ?',
    INSERTBOOK = 'insert into totos set title = ?';


app.use('/assets', express.static(__dirname + '/assets'));
app.use('/', express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use('/app/scripts', express.static(__dirname + '/app'));
// app.use('/app/styles', express.static(__dirname + '/app'));
// app.use('/music', express.static(__dirname + '/music'));


app.get('/book', function(req, res) {
    console.log(req.query);
    var start = parseInt(req.query.page_size) * (parseInt(req.query.current_page) - 1);
    console.log(start);
    client.query(SELECTBOOKS, [start, parseInt(req.query.page_size)], function (err0, res0) {
        if (err0) console.log(err0);
        console.log(res0);
        var detail = [{per_page: 5, total_entries:17, total_pages:4,page:1},res0]
        return res.send(detail);
    });
});

app.put('/book/:id', function(req, res) {
    console.log(req.body);
    client.query(UPDATEBOOK, [req.body.title,req.body.id],function (err0, res0) {
        if (err0) console.log(err0);
        return res.send(res0);
    });
});

app.delete('/book/:id', function(req, res) {
    client.query(DELETEBOOK, [req.params.id],function (err0, res0) {
        if (err0) console.log(err0);
        return res.send(res0);
    });
});
app.post('/book', function(req, res) {
    client.query(INSERTBOOK, [req.body.title],function (err0, res0) {
        if (err0) console.log(err0);
        return res.send(res0);
    });
});
