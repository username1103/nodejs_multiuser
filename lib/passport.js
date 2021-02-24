const db = require("../lib/db");

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
        const user = db
          .get("users")
          .find({ email: email, password: password })
          .value();
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, {
            message:
              "가입되지 않았거나 이메일 또는 비밀번호가 정확하지 않습니다.",
          });
        }
      }
    )
  );

  return passport;
};
