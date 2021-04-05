const db = require("../lib/db");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

module.exports = function (app) {
  // passport import
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  // passport initialize and use session
  app.use(passport.initialize());
  app.use(passport.session());

  // serialize user
  // save user identifier in sessions
  passport.serializeUser(function (user, done) {
    console.log(user);
    // user.id만 세션에 저장
    done(null, user.id);
  });

  // When visit page, active this function
  // id는 세션에 저장된 id값을 가져옴
  passport.deserializeUser(function (id, done) {
    console.log(id);
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

  const {
    web: { client_id, client_secret, redirect_uris },
  } = require("../config/google.json");
  passport.use(
    new GoogleStrategy(
      {
        clientID: client_id,
        clientSecret: client_secret,
        callbackURL: redirect_uris[1],
      },
      function (accessToken, refreshToken, profile, done) {
        const email = profile.emails[0].value;
        const google_id = profile.id;
        const user = db.get("users").find({ email: email }).value();
        if (user) {
          bcrypt.compare(google_id, user.password).then((result) => {
            if (result) {
              done(null, user);
            } else {
              const google_name = profile.displayName;
              const user_data = {
                id: shortid.generate(),
                email: email,
                password: hash,
                displayName: google_name,
              };
              db.get("users").push(user_data).write();
              done(null, user_data);
            }
          });
        } else {
          const google_name = profile.displayName;
          const user_data = {
            id: shortid.generate(),
            email: email,
            password: hash,
            displayName: google_name,
          };
          db.get("users").push(user_data).write();
          done(null, user_data);
        }
      }
    )
  );

  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/login" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/");
    }
  );

  return passport;
};
