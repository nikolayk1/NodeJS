let express = require("express");

let router = express.Router();

const fs = require("fs");
const { task } = require("os");

/* GET home page. */

//Показване на Login форма

router.get("/login", function (req, res) {
  res.render("login", { info: "Please enter your Login Credentials" });
});

//Създаване на сесия след успешен Login

session = require("express-session"); //Как да намерим информация за този модул?

router.use(
  session({
    secret: "random string",

    resave: true,

    saveUninitialized: true,
  })
);

sqlite3 = require("sqlite3");

db = new sqlite3.Database("task.sqlitedb");

db.serialize();

db.run(`CREATE TABLE IF NOT EXISTS task(

    id INTEGER PRIMARY KEY,

    user TEXT NOT NULL,

    task TEXT,

    url TEXT,

    type TEXT,

    date_created TEXT)`);

db.parallelize();

fileUpload = require("express-fileupload");

router.use(fileUpload());

bcrypt = require("bcryptjs");

users = require("./passwd.json");

router.post("/login", function (req, res) {
  bcrypt.compare(
    req.body.password,
    users[req.body.username] || "",
    function (err, is_match) {
      if (err) throw err;

      if (is_match === true) {
        req.session.username = req.body.username;

        req.session.count = 0;

        res.redirect("/task/");
      } else {
        res.render("login", { warn: "You will have to try again" });
      }
    }
  );
});

//Logout - унищожаване на сесия

router.get("/logout", (req, res) => {
  req.session.destroy();

  res.redirect("/task/");
});

router.all("*", function (req, res, next) {
  if (!req.session.username) {
    res.redirect("/task/login");

    return;
  }
  next();
});

//CRUD
//cREADud
router.get("/", function (req, res, next) {
  req.session.count++;

  s = "Current User : " + req.session.username;

  db.all(
    "SELECT * FROM task ORDER BY task DESC;",
    function (err, rows) {
      if (err) throw err;

      res.render("task", { info: s, rows: rows });
    }
  );
}); //вече няма проверки на url address, защото няма next
//CREATErud + Picture upload

router.post("/upload", (req, res) => {
  url = "";

  if (req.files && req.files.file) {
    req.files.file.mv("./public/images/" + req.files.file.name, (err) => {
      if (err) throw err;
    });

    url = "/images/" + req.files.file.name;
  }

  db.run(
    `
    
            INSERT INTO task(
    
                user,
    
                task,
    
                url,
    
                type,
    
               date_created
    
            ) VALUES (
    
                ?,
    
                ?,
    
                ?,
    
                ?,
    
                DATETIME('now','localtime'));
    
            `,

    [req.session.username, req.body.task || "", url,req.body.type],

    (err) => {
      if (err) throw err;

      res.redirect("/task/");
    }
  );
});

//cruDELETE

router.post("/delete", (req, res) => {
  db.run("DELETE FROM task WHERE id = ?", req.body.id, (err) => {
    if (err) throw err;

    res.redirect("/task/");
  });
});

//crUPDATEd

router.post("/update", (req, res) => {
  db.run(
    `UPDATE task
    
                SET user = ?,
    
                    task = ?,
    
                    url = ?,
                    
                    type = ?,
    
                    date_created = DATETIME('now','localtime')
    
                WHERE id = ?;`,

    req.session.username,

    req.body.task,

    req.body.url,

    req.body.type,

    req.body.id,

    (err) => {
      if (err) throw err;

      res.redirect("/task/");
    }
  );
});

router.all("*", function (req, res) {
  res.send("No such page or action! Go to: <a href='/task/'>main page</a>");
});

module.exports = router;
