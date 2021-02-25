const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const path = require("path");
const logger = require("morgan");
const helmet = require("helmet");
const fs = require("fs");

const express = require("express");
const session = require("express-session");
const LowdbStore = require("lowdb-session-store")(session);
const db = require("./lib/db");
const flash = require("connect-flash");

const app = express();
const port = 3000;

app.use(helmet());

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "@23t45623!#513res",
    resave: false,
    saveUninitialized: true,
    store: new LowdbStore(db.get("sessions"), { ttl: 86400 }),
  })
);

app.use(flash());

const passport = require("./lib/passport")(app);
const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth")(passport);

app.get("*", (req, res, next) => {
  req.list = db.get("topics").value();
  next();
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  res.status(404).send("sorry cant find that");
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("something broke!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
