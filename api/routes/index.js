var express = require('express');
var router = express.Router();

const fs = require("fs");

let routes = fs.readdirSync(__dirname);
//Dinamik routing yapısı. Dosya ismi ile route oluşturur.
for (let route of routes) {
  if (route.includes(".js") && route != "index.js") {
    router.use("/" + route.replace(".js", ""), require('./' + route));
  }
}

module.exports = router;