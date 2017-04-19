const cors = require('cors')
var http = require('http'),
    fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    mysql = require('mysql');

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(cors())

var jsonParser = bodyParser.json()

var mysql_conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'CSV_DB'
});

app.listen(3943)

var table = "ready";

app.post('/', jsonParser, function (req, res) {
    name = req.body.firstName;
        console.log("one");

    var query = mysql_conn.query('SELECT * FROM author WHERE Name = "'+name +'"', function(err, result){
        res.json(result);
        table = result;
    });
    query
    .on('error', function(err) {
        // Handle error, an 'end' event will be emitted after this as well
    })
    .on('result', function(row) {
        console.log("three");
        // Pausing the connnection is useful if your processing involves I/O
        mysql_conn.pause();
        
        processRow(row, function() {
        mysql_conn.resume();
        });
    })
    .on('end', function() {
        // all rows have been received
        console.log("two");
        console.log('end after mysql');
    });
    function processRow(row,callback){
        console.log(row);
        callback();
    } 
})

app.get('/', (req, res) => {
    res.json(table);
})

