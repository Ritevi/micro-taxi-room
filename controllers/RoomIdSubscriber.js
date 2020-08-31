const Room = require("../models/Room").Room;

exports.post = async function (req, res, next) {
  const { roomId } = req.params;
  const { userId } = req.body;
  try {
    let room = await Room.subscribe(roomId, userId);
    res.json(await room.getJSON());
  } catch (err) {
    next(err);
  }
};

exports.get = async function (req, res, next) {
  const { roomId } = req.params;
  try {
    let jsonUsers = [];
    let users = await Room.getSubs(roomId);
    for (let user of users) {
      await jsonUsers.push(await users.getJSON());
    }
    res.json(jsonUsers);
  } catch (err) {
    next(err);
  }
};
