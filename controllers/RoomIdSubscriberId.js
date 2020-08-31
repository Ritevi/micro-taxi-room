const Room = require("../models/Room").Room;

exports.delete = async function (req, res, next) {
  const { roomId, userId } = req.params;
  try {
    let user = await Room.unsubscribe(roomId, userId);
    res.json(await user.getJSON());
  } catch (err) {
    next(err);
  }
};
