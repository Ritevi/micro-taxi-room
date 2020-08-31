const createError = require("http-errors");
// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const httpError = require("./error/httpError");
const dbError = require("./error/DbError");
const paramError = require("./error/paramError");
const MicroMQ = require('micromq');

const app = new MicroMQ({
    name: 'room',
    rabbit: {
        url: process.env.RABBIT_URL,
    },
});



const roomApiRouter = require("./routes/RoomApi");
//
// const app = express();

app.get("/favicon.ico", (req, res) => res.status(204));

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
roomApiRouter(app);
// app.use("/api", roomApiRouter);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    let error = {};
    if (req.app.get("env") === "development") {
        error = err;
    } else {
        error = err.toUser();
        if (err instanceof paramError ) {
           err.status =400; //todo change this status
        } else if(err instanceof httpError){
            error.status = err.status;
        }
    }
    res.status(error.status || 500);
    res.json(err);
});

module.exports = app;
