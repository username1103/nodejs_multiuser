const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");

router.get("/", (req, res) => {
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
      <img src="/images/coding.jpg">`,
    `<a href="/topic/create">create</a>`,
    auth.statusUI(req)
  );
  res.send(html);
});

module.exports = router;
