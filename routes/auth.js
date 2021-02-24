const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");
const db = require("../lib/db");
const shortid = require("shortid");

module.exports = function (passport) {
  router.get("/login", (req, res) => {
    const fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    const title = "WEB - login";
    const list = template.list(req.list);
    var html = template.HTML(
      title,
      list,
      `
      <div class="feedback">${feedback}</div>
      <form action="/auth/login" method="post">
        <p><input type="text" name="email" placeholder="이메일"></p>
        <p><input type="password" name="password" placeholder="비밀번호"></p>
        <p><input type="submit"></p>
      </form>
      `,
      "",
      auth.statusUI(req)
    );
    res.send(html);
  });

  // login event process
  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
    })
  );

  router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  router.get("/register", (req, res) => {
    const fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    const title = "WEB - 회원가입";
    const list = template.list(req.list);
    var html = template.HTML(
      title,
      list,
      `
      <div class="feedback">${feedback}</div>
      <form action="/auth/register" method="post">
        <p><input type="text" name="email" placeholder="이메일"></p>
        <p><input type="password" name="password" placeholder="비밀번호"></p>
        <p><input type="password" name="password_confirm" placeholder="비밀번호확인"></p>
        <p><input type="text" name="displayName" placeholder="이름"></p>
        <p><input type="submit" value="등록"></p>
      </form>
      `,
      "",
      auth.statusUI(req)
    );
    res.send(html);
  });

  router.post("/register", (req, res) => {
    var post = req.body;
    var email = post.email;
    var password = post.password;
    var password_confirm = post.password_confirm;
    var displayName = post.displayName;

    if (email === "" || password === "" || displayName === "") {
      req.flash("error", "모든 값을 채워주세요.");
      res.redirect("/auth/register");
    } else if (db.get("users").find({ email: email }).value() !== undefined) {
      req.flash("error", "이미 존재하는 이메일 입니다.");
      res.redirect("/auth/register");
    } else if (password !== password_confirm) {
      req.flash("error", "비밀번호와 비밀번화 확인 값이 다릅니다.");
      res.redirect("/auth/register");
    } else if (
      db.get("users").find({ displayName: displayName }).value() !== undefined
    ) {
      req.flash("error", "이미 존재하는 닉네임 입니다.");
      res.redirect("/auth/register");
    } else {
      const user = {
        id: shortid.generate(),
        email: email,
        password: password,
        displayName: displayName,
      };
      db.get("users").push(user).write();
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    }
  });

  return router;
};
