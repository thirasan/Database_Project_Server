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
    database: 'Library'
});

app.listen(3943)

var table = "ready";

app.post('/app', jsonParser, function (req, res) {
    text = `'%` +req.body.text + `%'`;
    award = `'%` + req.body.award + `%'`;
    pagecount = req.body.pagecount;

    SELECT = 'SELECT Book.Book_ID, Book.BookName, Book.PageCount, Author.AuthorName, BookAward.AwardName ';
    FROM = 'FROM book '
    JOIN = 'LEFT JOIN BookAwardRelation ON Book.Book_ID = BookAwardRelation.Book_ID LEFT JOIN BookAward ON BookAwardRelation.BookAward_ID = BookAward.BookAward_ID ';
    JOIN2 = 'LEFT JOIN Author ON book.author_ID = author.author_ID ';
    WHERE = 'WHERE (book.BookName LIKE ' + text +' OR Author.AuthorName LIKE ' + text +') ';

    if(req.body.award != '')
        AWARDFILTER = 'AND BookAward.AwardName LIKE '+award+' ';
    else
        AWARDFILTER = '';

    if(req.body.pagecountState == ">=")
        PAGEFILTER = 'AND Book.PageCount >= ' + pagecount + ' ';
    else if(req.body.pagecountState == "<=")
        PAGEFILTER = 'AND Book.PageCount <= ' + pagecount + ' ';
    else
        PAGEFILTER = '';

    ORDER = 'ORDER BY Book.Book_ID'

    console.log(award);
    var query = mysql_conn.query(''+ SELECT + FROM + JOIN + JOIN2 + WHERE + AWARDFILTER + PAGEFILTER + ORDER, function(err, result){
        table = result;
        res.json(result);
    });
    query
    .on('error', function(err) {
        // Handle error, an 'end' event will be emitted after this as well
    })
    .on('result', function(row) {
        // Pausing the connnection is useful if your processing involves I/O
        mysql_conn.pause();
        
        processRow(row, function() {
        mysql_conn.resume();
        });
    })
    .on('end', function() {
        // all rows have been received
        console.log('end after mysql');
    });
    function processRow(row,callback){
        callback();
    } 
})

app.get('/digital', jsonParser, function (req, res) {
    name = req.body.firstName;
    console.log(name);
    console.log("sure");
    var query = mysql_conn.query('SELECT * FROM digitalmedia', function(err, result){
        table = result;
        res.json(result);
    });
    query
    .on('error', function(err) {
        // Handle error, an 'end' event will be emitted after this as well
    })
    .on('result', function(row) {
        // Pausing the connnection is useful if your processing involves I/O
        mysql_conn.pause();
        
        processRow(row, function() {
        mysql_conn.resume();
        });
    })
    .on('end', function() {
        // all rows have been received
        console.log('end after mysql');
    });
    function processRow(row,callback){
        callback();
    } 
})

app.get('/book/:name', jsonParser, (req ,res) => {
    const name = req.params.name
    var query = mysql_conn.query('SELECT * FROM book WHERE Book_ID="' + name + '"', function(err, result){
        table = result;
        res.json(result);
    });
    query
    .on('error', function(err) {
        // Handle error, an 'end' event will be emitted after this as well
    })
    .on('result', function(row) {
        // Pausing the connnection is useful if your processing involves I/O
        mysql_conn.pause();
        
        processRow(row, function() {
        mysql_conn.resume();
        });
    })
    .on('end', function() {
        // all rows have been received
        console.log('end after mysql');
    });
    function processRow(row,callback){
        callback();
    }
})

app.get('/query/:code', jsonParser, (req ,res) => {
    var fun;
    switch(req.params.code) {
        case '1':
            fun = 'SELECT Book.BookName, COUNT(BookGenre.Genre) AS "Number of genres" FROM BookGenre, Book WHERE Book.Book_ID = BookGenre.Book_ID GROUP BY BookName ORDER BY COUNT(BookGenre.Genre) Desc';
            break;
        case '2':
            fun = 'SELECT * FROM Author a1, Author a2 WHERE a1.Birthdate = a2.Birthdate AND a1.AuthorName <> a2.AuthorName';
            break;
        case '3':
            fun = 'SELECT SUM(PageCount) AS "Total pages of Harry Potter series" FROM Book WHERE BookName LIKE "%Harry Potter%"';
            break;
        case '4':
            fun = 'SELECT Member.MemberName, BookBorrowingBill.BookBorrowingBill_ID, DigitalMediaBorrowingBill.MediaBorrowingBill_ID FROM Member INNER JOIN BookBorrowingBill ON Member.Member_ID = BookBorrowingBill.Member_ID INNER JOIN  DigitalMediaBorrowingBill ON Member.Member_ID = DigitalMediaBorrowingBill.Member_ID';
            break;
        case '5':
            fun = 'SELECT BookBorrowingCount.BookName, MAX(BookBorrowingCount.NumberOfBorrowing) AS "MostBorrowedNumber" FROM (SELECT Book.Book_ID, Book.BookName, COUNT(bookborrowingbill.Book_ID) AS "NumberOfBorrowing" FROM Book, BookBorrowingBill WHERE Book.Book_ID = bookborrowingbill.Book_ID GROUP BY bookborrowingbill.Book_ID) AS BookBorrowingCount GROUP BY BookName ORDER BY NumberOfBorrowing DESC LIMIT 1';
            break;
        case '6':
            fun = 'SELECT * FROM DigitalMedia WHERE Year BETWEEN 2000 AND 2010';
            break;
        default:
            fun = '';
            break;
    }
    console.log(fun);
    var query = mysql_conn.query(''+fun, function(err, result){
        table = result;
        res.json(result);
    });
    query
    .on('error', function(err) {
        // Handle error, an 'end' event will be emitted after this as well
    })
    .on('result', function(row) {
        // Pausing the connnection is useful if your processing involves I/O
        mysql_conn.pause();
        
        processRow(row, function() {
        mysql_conn.resume();
        });
    })
    .on('end', function() {
        // all rows have been received
        console.log('end after mysql');
    });
    function processRow(row,callback){
        callback();
    }
})


app.get('/', (req, res) => {
    res.json(table);
})

