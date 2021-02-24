const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const path = require("path");
const logger = require("morgan");
const helmet = require("helmet");
const fs = require("fs");

const express = require("express");
const session = require("express-session");
// const FileStore = require("session-file-store")(session);
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
    // store: new FileStore(), // 파일 스토어를 이용하는 경우 세션 데이터를 파일로 저장하는 시간에 의해서 에러가 발생함
  })
);

app.use(flash());

const passport = require("./lib/passport")(app);
const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth")(passport);

app.get("*", (req, res, next) => {
  fs.readdir("./data", function (error, filelist) {
    req.list = filelist;
    next();
  });
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
