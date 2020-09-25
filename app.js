const createError = require("http-errors");
// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const httpError = require("./error/httpError");
const dbError = require("./error/DbError");
const paramError = require("./error/paramError");
const RabbitApp = require('./libs/RabbitRPC');
let config = require("./config");

let rabbitInstance = new RabbitApp("amqp://10.10.0.2");
const router = require('./routes/RoomApi');

setTimeout(()=>{
    rabbitInstance.startRPC();
    router(rabbitInstance);
},2000)





// error handler
// app.use(function (err, req, res, next) {
//     // set locals, only providing error in development
//     let error = {};
//     if (req.app.get("env") === "development") {
//         error = err;
//     } else {
//         error = err;
//         if (err instanceof paramError ) {
//            err.status =400; //todo change this status
//         } else if(err instanceof httpError){
//             error.status = err.status;
//         }
//     }
//     res.status=error.status || 500;
//     res.json(err);
// });
