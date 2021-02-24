module.exports = function (app) {
  // authData
  const authData = {
    email: "auddlf419@naver.com",
    password: "auddlf123",
    nickname: "myeongil",
  };
  // passport import
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;

  // passport initialize and use session
  app.use(passport.initialize());
  app.use(passport.session());

  // serialize user
  // save user identifier in sessions
  passport.serializeUser(function (user, done) {
    // user.email = user identifier => save data in sessions
    done(null, user.email);
  });

  // When visit page, active this function
  // In session, user's data is id
  passport.deserializeUser(function (id, done) {
    // Add authData in request's user
    done(null, authData);
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
