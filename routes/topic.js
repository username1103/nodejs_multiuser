const express = require("express");
const template = require("../lib/template");
const sanitizeHtml = require("sanitize-html");
const path = require("path");
const router = express.Router();
const auth = require("../lib/auth");
const db = require("../lib/db");
const shortid = require("shortid");

router.get("/create", (req, res) => {
  if (!auth.isOwner(req)) {
    req.flash("error", "로그인해야 사용 가능합니다.");
    return res.redirect("/");
  }
  var title = "WEB - create";
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `
    <form action="/topic/create" method="post">
      <p><input type="text" name="title" placeholder="제목"></p>
      <p><textarea name="description" placeholder="내용"></textarea></p>
      <p><input type="submit"></p>
    </form>
    `,
    "",
    auth.statusUI(req)
  );
  res.send(html);
});

router.post("/create", (req, res) => {
  if (!auth.isOwner(req)) {
    req.flash("error", "로그인해야 사용 가능합니다.");
    return res.redirect("/");
  }
  var post = req.body;
  var title = post.title;
  var description = post.description;
  const id = shortid.generate();
  const date = new Date();
  db.get("topics")
    .push({
      id: id,
      title: title,
      description: description,
      user_id: req.user.id,
      createdate: date,
      updatedate: date,
    })
    .write();
  res.redirect(`/topic/${id}`);
});

router.get("/update/:pageId", (req, res) => {
  console.log(path.parse(req.params.pageId).base);
  if (!auth.isOwner(req)) {
    req.flash("error", "로그인해야 이용가능 합니다.");
    return res.redirect(`/topic/${req.params.pageId}`);
  }
  let topic = db.get("topics").find({ id: req.params.pageId }).value();
  if (req.user.id !== topic.user_id) {
    req.flash("error", "자신이 쓴 글만 수정가능합니다.");
    return res.redirect(`/topic/${topic.id}`);
  }
  const title = topic.title;
  const description = topic.description;
  const list = template.list(req.list);
  const html = template.HTML(
    title,
    list,
    `
    <form action="/topic/update" method="post">
      <input type="hidden" name="id" value="${topic.id}">
      <p><input type="text" name="title" placeholder="title" value="${title}"></p>
      <p><textarea name="description" placeholder="description">${description}</textarea></p>
      <p><input type="submit"></p>
    </form>
      `,
    `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>`,
    auth.statusUI(req)
  );
  res.send(html);
});

router.post("/update", (req, res) => {
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  db.get("topics")
    .find({ id: id })
    .assign({ title: title, description: description, updatedate: new Date() })
    .write();
  res.redirect(`/topic/${id}`);
});

router.post("/delete", (req, res) => {
  var post = req.body;
  var id = post.id;
  if (!auth.isOwner(req)) {
    req.flash("error", "로그인해야 이용가능 합니다.");
    return res.redirect(`/topic/${id}`);
  }
  let topic = db.get("topics").find({ id: id }).value();
  if (req.user.id !== topic.user_id) {
    req.flash("error", "자신이 쓴 글만 삭제가능합니다.");
    return res.redirect(`/topic/${id}`);
  }
  db.get("topics").remove({ id: id }).write();
  res.redirect("/");
});

router.get("/:pageId", (req, res) => {
  const fmsg = req.flash();
  let feedback = "";
  if (fmsg.error) {
    feedback = fmsg.error[0];
  }

  const topic = db.get("topics").find({ id: req.params.pageId }).value();
  const author = db.get("users").find({ id: topic.user_id }).value();
  const sanitizedTitle = sanitizeHtml(topic.title);
  const sanitizedDescription = sanitizeHtml(topic.description, {
    allowedTags: ["h1", "a"],
  });
  const list = template.list(req.list);
  const html = template.HTML(
    sanitizedTitle,
    list,
    `
    <h2>${sanitizedTitle}</h2>
    <div>
    <p>저자 : ${author.displayName}, 작성일 : ${topic.createdate}, 수정일 : ${topic.updatedate}</p>
    </div>
    <div>
    ${sanitizedDescription}
    </div>
    `,
    `
    <div class="feedback">${feedback}</div>
    <a href="/topic/create">create</a> 
    <a href="/topic/update/${topic.id}">update</a>
    <form action="/topic/delete" method="post">
      <input type="hidden" name="id" value="${topic.id}">
      <input type="submit" value="delete">
    </form>
    `,
    auth.statusUI(req)
  );
  res.send(html);
});

module.exports = router;
