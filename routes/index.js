var express = require("express");
var router = express.Router();

router.get ("/", function (req, res, next){
  res.render('index',{title:'Welcome'});
  });

  router.get('/login', function(req, res) {
    res.redirect('/task/login');
  });

module.exports = router;
