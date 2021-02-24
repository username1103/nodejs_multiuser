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
      function (username, password, done) {
        if (username === authData.email) {
          if (password === authData.password) {
            return done(null, authData);
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        } else {
          return done(null, false, { message: "Incorrect username." });
        }
      }
    )
  );
  return passport;
};
