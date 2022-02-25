const express = require('express');
const app = express();
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors')
const bcrypt = require('bcrypt')
const basicAuth = require('express-basic-auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Files')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/login", basicAuth({ users: { 'admin': 'admin123' } }) , function (req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {

  });


  db.all(`SELECT * FROM Users WHERE username = "${req.query.username}"`, function (err, rows) {
    console.log(rows)
    console.log(err)
    const row = rows[0];
    if (row === undefined) {
      res.json({ status: false })
    }
    else {
      bcrypt.compare(req.query.password, row.password).then(result => {
        if (result) {
          res.json({ status: true, username: row.username })
        }

        else {
          res.json({ status: false })
        }
      })
    }


  })
})




app.get("/data", basicAuth({ users: { 'admin': 'admin123' } }), function (req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {

  });
  db.all(`SELECT * FROM Users WHERE username = "${req.query.username}"`, function (err, rows) {
    const row = rows[0]
    const usage = row.used / 1000000000
    const usedd = usage*100
    const used = Math.round(usedd * 1000) / 1000
    res.json({ username: row.username, id: row.ID, used: used, type: row.type })
  })

})

app.post("/register", basicAuth({ users: { 'admin': 'admin123' } }), function (req, res) {
  const sqlite3 = require('sqlite3').verbose();
  const type = "FREE"
  const salt = 10
  bcrypt.hash(req.body.password, salt).then(password => {
    let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {
    });
    db.all("SELECT * FROM Users WHERE username =" + "'" + req.body.username + "'" + " OR password = " + "'" + password + "'", function (err, rows) {
      console.log(rows)
      if (rows.length < 1) {
        const sqlite3 = require('sqlite3').verbose();
        let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {
          db.run(`INSERT INTO Users (username,password,type,used) VALUES ('${req.body.username}','${password}','${type}',${0})`);

        })

      }
      else {
        res.json({ exist: true })
      }
    })
  })
})

app.post('/files/upload',upload.single('file') ,function (req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return err;
    }
  })
  db.all(`SELECT * FROM Users WHERE username = "${req.body.name}"`, function (err, rows) {
    const row = rows[0]
    const sumBytes = row.used + req.file.size
    if (sumBytes >= 1000000000) {
      res.json({ status: false})
    }
    else {
      const oldName = path.parse(req.file.originalname).name + path.parse(req.file.originalname).ext
    
      const name = uuidv4() + path.parse(req.file.originalname).ext
    
    
      fs.rename(__dirname + `/Files/${oldName}`, __dirname + `/Files/${name}`, function (err) {
        if (err) console.log('ERROR: ' + err);
      });
      const Link = `${name}`
      db.run(`INSERT INTO Files (OriginalName,name,Owner,size) VALUES ('${oldName}','${Link}','${req.body.name}','${req.file.size}')`);
      
      db.all(`SELECT * FROM Users WHERE username = "${req.body.name}"`, function (err, rows) {
        const d = rows[0]
        const sum = d.used + req.file.size
        console.log(sum)
        db.all(`UPDATE Users SET used = '${sum}' WHERE username ='${req.body.name}'`)
      })
    
      res.json({status: true})
    }
  })

})

app.get('/files',function (req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {

  });
  db.all(`SELECT * FROM Files WHERE Owner = "${req.query.username}"`, function (err, rows) {
    res.json(rows)
  })
})

app.get('/download/:user/:name',function (req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return err;
    }
  })

  db.all(`SELECT * FROM Files WHERE name = "${req.params.name}" AND Owner = "${req.params.user}"`, function (err, rows) {
    if (rows.length < 1) {
      console.log("Can't find")
    }
    else {
      const row = rows[0]
      res.download(__dirname+`/Files/${row.name}`)
      console.log("Downloaded")
    }
  })
})

app.delete('/files/delete',function (req, res) {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return err;
    }
  })
  db.all(`SELECT * FROM Files WHERE Owner = "${req.query.username}" AND name = "${req.query.name}"`, function (err, rows) {
    const row = rows[0]

    db.all(`SELECT * FROM Users WHERE username = "${req.query.username}"`, function (err, rowss) {
      const d = rowss[0]
      const sum = d.used - row.size
      db.all(`UPDATE Users SET used = '${sum}' WHERE username ='${req.query.username}'`)
    })
    db.run(`DELETE FROM Files WHERE name = "${req.query.name}" AND Owner = "${req.query.username}"`)

    fs.unlink(`Files/${row.name}`, function (err) {
      if (err) throw err;
      console.log('File deleted!');
    });
  })

  res.json({status:true})
})

app.get('/public/:name',function (req, res) {
  res.sendFile(__dirname+`/public/${req.params.name}`)
})

app.listen(3001)