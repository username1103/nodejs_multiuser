const express = require("express");
const template = require("../lib/template");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const path = require("path");
const router = express.Router();
const auth = require("../lib/auth");

router.get("/create", (req, res) => {
  if (!auth.isOwner(req)) {
    res.redirect("/");
    return false;
  }
  var title = "WEB - create";
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `
                <form action="/topic/create" method="post">
                  <p><input type="text" name="title" placeholder="title"></p>
                  <p>
                    <textarea name="description" placeholder="description"></textarea>
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
              `,
    "",
    auth.statusUI(req)
  );
  res.send(html);
});

router.post("/create", (req, res) => {
  if (!auth.isOwner(req)) {
    res.redirect("/");
    return false;
  }
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`./data/${title}`, description, "utf8", function (err) {
    res.redirect(`/topic/${title}`);
  });
});

router.get("/update/:pageId", (req, res) => {
  if (!auth.isOwner(req)) {
    res.redirect("/");
    return false;
  }
  var filteredId = req.params.pageId;
  fs.readFile(`./data/${filteredId}`, "utf8", function (err, description) {
    var title = filteredId;
    var list = template.list(req.list);
    var html = template.HTML(
      title,
      list,
      `
                <form action="/topic/update" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                    <textarea name="description" placeholder="description">${description}</textarea>
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
                `,
      `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,
      auth.statusUI(req)
    );
    res.send(html);
  });
});

router.post("/update", (req, res) => {
  if (!auth.isOwner(req)) {
    res.redirect("/");
    return false;
  }
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`./data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`./data/${title}`, description, "utf8", function (err) {
      res.redirect(`/topic/${title}`);
    });
  });
});

router.post("/delete", (req, res) => {
  if (!auth.isOwner(req)) {
    res.redirect("/");
    return false;
  }
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`./data/${filteredId}`, function (error) {
    res.redirect(`/`);
  });
});

router.get("/:pageId", (req, res, next) => {
  var filteredId = req.params.pageId;
  fs.readFile(`./data/${filteredId}`, "utf8", function (err, description) {
    if (err) return next(err);

    var title = filteredId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizedDescription = sanitizeHtml(description, {
      allowedTags: ["h1", "a"],
    });
    var list = template.list(req.list);
    var html = template.HTML(
      sanitizedTitle,
      list,
      `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
      ` <a href="/topic/create">create</a>
                      <a href="/topic/update/${sanitizeHtml(title)}">update</a>
                      <form action="/topic/delete" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                      </form>`,
      auth.statusUI(req)
    );
    res.send(html);
  });
});

module.exports = router;
