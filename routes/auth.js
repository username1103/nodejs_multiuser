const express = require("express");
const router = express.Router();
const template = require("../lib/template");

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
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
        <input type="submit">
        </p>
    </form>
    `,
      "",
      `<a href="/auth/login">login</a>`
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

  return router;
};
