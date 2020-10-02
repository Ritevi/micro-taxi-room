
const express = require('express');
const path = require('path');
const logger = require('morgan');
const httpError = require("./error/httpError");
const dbError = require("./error/DbError");
const paramError = require("./error/paramError");



const roomApiRouter = require("./routes/RoomApi");

const app = express();
app.get("/favicon.ico", (req, res) => res.status(204));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
roomApiRouter(app);
// app.use("/api", roomApiRouter);
// error handler

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
        let error = err;
        console.log(error);
        if (req.app.get("env") === "development") {

        } else {
            if (err instanceof paramError ) {
                //  error = error.toUser();
                // err.status =400; //todo change this status
            } else if(err instanceof httpError){
                error = error.toUser();
                error.status = err.status;
            } else if(err instanceof dbError){
                error = error.toUser();
            }
            error = {message:"internal server error"};
        }
        res.status(error.status || 500);
        res.json(error);
    //prod doesnt work
});

app.use((req,res)=>{
    res.status(404);
    res.json({message:"no route"});
})


module.exports = app;
