// var Sequelize = require("../libs/sequelize");

class httpError extends Error {
  constructor(name, code, status, message) {
    super(arguments);
    this.name = name;
    this.code = code;
    this.status = status;
    this.message = message || [name, code].join(" ");
    this.error = {};
  }
  // static SeqInHttp(err) {
  //   if (err instanceof httpError) {
  //     return err;
  //   } else {
  //     let HttpError = new httpError(
  //       "sequilize",
  //       "DbError",
  //       500,
  //       "internal server error"
  //     );
  //     HttpError.error = err;
  //     return HttpError;
  //   }
  // }
  toUser() {
    let { error, ...rest } = this;
    return rest;
  }
}

module.exports = httpError;
