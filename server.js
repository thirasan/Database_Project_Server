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
    var gen = req.body.genres + '';
    var genres = gen.split(',');

    SELECT = 'SELECT Book.Book_ID, Book.BookName, Book.PageCount, Author.AuthorName, BookAward.AwardName ';
    FROM = 'FROM book '
    JOIN = 'LEFT JOIN BookAwardRelation ON Book.Book_ID = BookAwardRelation.Book_ID LEFT JOIN BookAward ON BookAwardRelation.BookAward_ID = BookAward.BookAward_ID ';
    JOIN2 = 'LEFT JOIN Author ON book.author_ID = author.author_ID ';
    JOIN3 = 'LEFT JOIN BookGenre ON Book.Book_ID = BookGenre.Book_ID ';
    GROUP = 'GROUP BY Book.Book_ID ';
    HAVING = ' ';
    ORDER = 'ORDER BY Book.Book_ID'
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

    if (gen != '') {
        WHERE += 'AND (';
        for (var i = 0;i<genres.length-1;i++) {
            WHERE += 'BookGenre.Genre = "'+ genres[i] + '"';
            if (i<genres.length-2) WHERE += ' OR ';
        }
        WHERE += ') ';
        HAVING = 'HAVING COUNT(Book.Book_ID) = '+ (genres.length-1) + ' ';
    }

    if (req.body.dateState == 'EQUALS') {
        WHERE += 'AND Book.FirstPublished = "'+req.body.dateStr+'" ';
    } else if (req.body.dateState == 'GREATER_THAN') {
        WHERE += 'AND Book.FirstPublished > "'+req.body.dateStr+'" ';
    } else if (req.body.dateState == 'LESS_THAN') {
        WHERE += 'AND Book.FirstPublished < "'+req.body.dateStr+'" ';
    } else if (req.body.dateState == 'BETWEEN'){
        WHERE += 'AND Book.FirstPublished BETWEEN "'+req.body.dateStr+'" AND "' + req.body.betweenStr + '" ';
    }

    var query = mysql_conn.query(''+ SELECT + FROM + JOIN + JOIN2 + JOIN3 + WHERE + AWARDFILTER + PAGEFILTER + GROUP + HAVING + ORDER, function(err, result){
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

app.post('/digital', jsonParser, function (req, res) {
    text = req.body.text;
    text = `'%`+text+`%'`;
    year = req.body.year;
    yearState = req.body.yearState;
    runtime = req.body.runtime;
    runtimeState = req.body.runtimeState;
    
    SELECT = 'SELECT * FROM DigitalMedia ';
    WHERE = 'WHERE (DigitalMedia.MediaName LIKE '+text+' OR DigitalMedia.Director LIKE ' + text +') ';
    if (yearState == ">=") {
        WHERE+='AND DigitalMedia.Year >= "'+year+'" ';
    } else if (yearState == "<="){
        WHERE+='AND DigitalMedia.Year <= "'+year+'" ';
    }
    

    if (runtimeState == ">=") {
        WHERE+='AND DigitalMedia.runtime >= "' +runtime+'" ';
    } else if (runtimeState == "<="){
        WHERE += 'AND DigitalMedia.runtime <= "' +runtime+ '" ';
    }
    var query = mysql_conn.query(SELECT + WHERE + "", function(err, result){
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

app.get('/bookAward/:id', jsonParser, (req ,res) => {
    const ID = req.params.id
    var query = mysql_conn.query('SELECT Book.Book_ID, BookAward.AwardName, BookAwardRelation.Year FROM Book LEFT JOIN BookAwardRelation ON Book.Book_ID = bookawardrelation.Book_ID LEFT JOIN BookAward ON BookAwardRelation.BookAward_ID = BookAward.BookAward_ID WHERE book.book_ID ="'+ ID + '" ', function(err, result){
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

app.get('/member', jsonParser, (req ,res) => {
    var query = mysql_conn.query('SELECT * FROM member', function(err, result){
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

app.get('/book/:id', jsonParser, (req ,res) => {
    const ID = req.params.id
    var query = mysql_conn.query('SELECT Book.Book_ID, Book.BookName, Book.PageCount, Book.FirstPublished, BookGenre.Genre, author.author_ID, author.authorName FROM author, BookGenre, Book WHERE Book.Book_ID = BookGenre.Book_ID AND book.Author_ID = author.Author_ID AND book.book_ID ="'+ ID + '" ', function(err, result){
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

app.get('/userBook/:id', jsonParser, (req ,res) => {
    const ID = req.params.id
    SELECT = 'SELECT BookBorrowingBill.BookBorrowingBill_ID, BookBorrowingBill.BorrowDate, BookBorrowingBill.ReturnDate, Book.BookName, Member.MemberName, Librarian.LibrarianName ';
    FROM = 'FROM BookBorrowingBill, Book, Member, Librarian ';
    WHERE = 'WHERE BookBorrowingBill.ReturnDate = "" AND BookBorrowingBill.Book_ID = Book.Book_ID AND BookBorrowingBill.Member_ID = Member.Member_ID AND BookBorrowingBill.Librarian_ID = Librarian.Librarian_ID AND BookBorrowingBill.Member_ID = "' + ID + '" ';
    var query = mysql_conn.query(SELECT + FROM + WHERE + "", function(err, result){
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

app.get('/userDigitalMedia/:id', jsonParser, (req ,res) => {
    const ID = req.params.id
    SELECT = 'SELECT DigitalMediaBorrowingBill.MediaBorrowingBill_ID, DigitalMediaBorrowingBill.BorrowDate, DigitalMediaBorrowingBill.ReturnDate, DigitalMedia.MediaName, Member.MemberName, Librarian.LibrarianName ';
    FROM = 'FROM DigitalMediaBorrowingBill, DigitalMedia, Member, Librarian ';
    WHERE = 'WHERE DigitalMediaBorrowingBill.ReturnDate = "" AND DigitalMediaBorrowingBill.Media_ID = DigitalMedia.Media_ID AND DigitalMediaBorrowingBill.Member_ID = Member.Member_ID AND DigitalMediaBorrowingBill.Librarian_ID = Librarian.Librarian_ID AND Member.Member_ID = "' + ID+'" ';
    var query = mysql_conn.query(SELECT + FROM + WHERE + "", function(err, result){
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

app.get('/author/:name', jsonParser, (req ,res) => {
    const id = req.params.name;
    var query = mysql_conn.query('SELECT * FROM author WHERE author_ID="' + id + '"', function(err, result){
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

app.get('/digitalMedia/:name', jsonParser, (req ,res) => {
    const name = req.params.name
    var query = mysql_conn.query('SELECT * FROM DigitalMedia WHERE Media_ID="' + name + '"', function(err, result){
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

app.get('/bookReturn/:id', jsonParser, (req ,res) => {
    var reqID = (req.params.id);
    var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        var returnDate = day + "/" + month + "/" + year;
    var query = mysql_conn.query('UPDATE BookBorrowingBill SET ReturnDate = "' + returnDate+'" WHERE BookBorrowingBill_ID = "' + reqID +'" ', function(err, result){
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

app.get('/digitalMediaReturn/:id', jsonParser, (req ,res) => {
    var reqID = (req.params.id);
    var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        var returnDate = day + "/" + month + "/" + year;
    var query = mysql_conn.query('UPDATE DigitalMediaBorrowingBill SET ReturnDate = "' + returnDate+'" WHERE MediaBorrowingBill_ID = "' + reqID +'" ', function(err, result){
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

app.post('/borrowBook', jsonParser, (req ,res) => {
    console.log(req.body.user)
    console.log(req.body.bookID)
    var BBID = "BB";
    var queryCount = mysql_conn.query('SELECT COUNT(BookBorrowingBill_ID) AS "NumBook" FROM BookBorrowingBill ', function(err, result){
        table = result;
        res.json(result);
    });
    queryCount
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
        if (table[0].NumBook++ > 99)
            BBID += table[0].NumMedia;
        else if(table[0].NumBook > 9)
            BBID += "0" + table[0].NumBook;
        else 
            BBID += "00" + table[0].NumBook;

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        var borrowDate = day + "/" + month + "/" + year;
        
        var queryLibrarian = mysql_conn.query('SELECT Librarian.Librarian_ID, COUNT(Librarian.Librarian_ID) AS "NumLib" FROM Librarian LEFT JOIN bookborrowingbill ON bookborrowingbill.Librarian_ID = Librarian.Librarian_ID GROUP BY Librarian_ID ORDER BY COUNT(Librarian.Librarian_ID), Librarian_ID LIMIT 1 ', function(err, result){
        librarian = result;});
        queryLibrarian
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
            var queryInsert = mysql_conn.query('INSERT INTO BookBorrowingBill (BookBorrowingBill_ID, BorrowDate, ReturnDate, Book_ID, Member_ID, Librarian_ID) VALUES ("'+ BBID+'", "'+ borrowDate+'", "", "' +req.body.bookID+'", "'+req.body.user+'", "'+librarian[0].Librarian_ID +'") ', function(err, result){
            });
            queryInsert
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
            });
        });
    
    });
    function processRow(row,callback){
        callback();
    }
})

app.post('/borrowDigitalMedia', jsonParser, (req ,res) => {
    var MBID = "MB";
    var queryCount = mysql_conn.query('SELECT COUNT(MediaBorrowingBill_ID) AS "NumMedia" FROM DigitalMediaBorrowingBill ', function(err, result){
        table = result;
        res.json(result);
    });
    queryCount
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
        if (table[0].NumMedia++ > 99)
            MBID += table[0].NumMedia;
        else if(table[0].NumMedia > 9)
            MBID += "0" + table[0].NumMedia;
        else 
            MBID += "00" + table[0].NumMedia;

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        var borrowDate = day + "/" + month + "/" + year;
        
        var queryLibrarian = mysql_conn.query('SELECT Librarian.Librarian_ID, COUNT(Librarian.Librarian_ID) AS "NumLib" FROM Librarian LEFT JOIN digitalmediaborrowingbill ON digitalmediaborrowingbill.Librarian_ID = Librarian.Librarian_ID GROUP BY Librarian_ID ORDER BY COUNT(Librarian.Librarian_ID), Librarian_ID LIMIT 1 ', function(err, result){
        librarian = result;});
        queryLibrarian
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
            var queryInsert = mysql_conn.query('INSERT INTO DigitalMediaBorrowingBill (MediaBorrowingBill_ID, BorrowDate, ReturnDate, Media_ID, Member_ID, Librarian_ID) VALUES ("'+ MBID+'", "'+ borrowDate+'", "", "' +req.body.mediaID+'", "'+req.body.user+'", "'+librarian[0].Librarian_ID +'") ', function(err, result){
            });
            queryInsert
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
            });
        });
    
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

