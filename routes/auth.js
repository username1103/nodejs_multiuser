const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");

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
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="password" placeholder="password"></p>
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
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="password" placeholder="password"></p>
        <p><input type="password" name="password_confirm" placeholder="password"></p>
        <p><input type="text" name="displayName" placeholder="nickname"></p>
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
    fs.writeFile(`./data/${title}`, description, "utf8", function (err) {
      res.redirect(`/topic/${title}`);
    });
  });

  return router;
};
