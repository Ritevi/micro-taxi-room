const TryCatchWrapper = require("./libs/TryCatchWrapper");

var tryFunc = function(firstArg, secondArg){
    console.log(firstArg,secondArg);
}

var WrappedFunc = TryCatchWrapper(tryFunc);

WrappedFunc("firstArg");