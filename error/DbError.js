class DbError extends Error {
  constructor(name, code, message) {
    super(arguments);
    this.name = name;
    this.code = code;
    this.message = message || [name, code].join(" ");
    this.error = {};
  }

  static SeqInDbError(err) {
    if (err instanceof DbError) {
      return err;
    } else {
      let dbError = new DbError(
        "sequilize",
        "DbError",
        "internal server error"
      );
      dbError.error = err;
      return dbError;
    }
  }

  toUser() {
    let { error, ...rest } = this;
    return rest;
  }
}
module.exports = DbError;
