const Room = require("../models/Room").Room;

//todo remake this as put method in roomid router
exports.post = async function (req, res, next) {
  const { roomId } = req.params;
  const { userId } = req.body;
  try {
    let room = await Room.changeOwner();
    res.json(await room.getJSON());
  } catch (err) {
    next(err);
  }
};

//todo delete this
exports.get = function (req, res, next) {
  const { roomId } = req.params;
  Room.getOwnerByRoomID(roomId)
    .then((owner) => {
      res.json(owner.getJSON());
    })
    .catch((err) => {
      next(err);
    });
};
