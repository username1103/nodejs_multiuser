const db = require("../lib/db");
const bcrypt = require("bcrypt");

module.exports = function (app) {
  // passport import
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;

  // passport initialize and use session
  app.use(passport.initialize());
  app.use(passport.session());

  // serialize user
  // save user identifier in sessions
  passport.serializeUser(function (user, done) {
    // user.id만 세션에 저장
    done(null, user.id);
  });

  // When visit page, active this function
  // id는 세션에 저장된 id값을 가져옴
  passport.deserializeUser(function (id, done) {
    const userData = db.get("users").find({ id: id }).value();
    // userData를 request.user에 추가해줌
    done(null, userData);
  });

  passport.use(
    // username, password settings
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      // compare usename and password
      function (email, password, done) {
        const user = db.get("users").find({ email: email }).value();
        if (user) {
          bcrypt.compare(password, user.password).then(function (result) {
            if (result) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "비밀번호가 올바르지 않습니다.",
              });
            }
          });
        } else {
          return done(null, false, {
            message: "해당 이메일로 가입된 정보가 없습니다.",
          });
        }
      }
    )
  );

  return passport;
};
