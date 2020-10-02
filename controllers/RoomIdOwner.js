const Room = require("../models/Room").Room;

//todo remake this as put method in roomid router
exports.post = async function (req, res, next) {
  const { roomId } = req.params;
  const { userId } = req.body;
  try {
    let room = await Room.changeOwner(roomId,userId);
    res.json(await room.getJSON());
  } catch (err) {
    next(err);
  }
};

//todo delete this
exports.get =async function (req, res, next) {
  const { roomId } = req.params;
  try{
    let owner =await Room.getOwnerByRoomID(roomId);
    res.json(await owner.getJSON());
  }catch (err){
    next(err);
  }
};

