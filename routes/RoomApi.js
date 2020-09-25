const RoomController = require("../controllers/Room");
const RoomIdController = require("../controllers/RoomId");
const RoomIdSubscriberController = require("../controllers/RoomIdSubscriber");
const RoomIdSubscriberIdController = require("../controllers/RoomIdSubscriberId");
const RoomIdOwnerController = require("../controllers/RoomIdOwner");

router = function (RabbitApp) {

    RabbitApp.consumeRPC("room.get",RoomController.get);
    RabbitApp.consumeRPC("room.post",RoomController.post);


    // RabbitApp.consume("room.post", RoomController.post);
    //
    // RabbitApp.get("/room/:roomId", RoomIdController.get);
    // RabbitApp.delete("/room/:roomId", RoomIdController.delete);
    //
    // RabbitApp.post(
    //     "/room/:roomId/subscriber",
    //     RoomIdSubscriberController.post
    // );
    // RabbitApp.get("/room/:roomId/subscriber", RoomIdSubscriberController.get);
    // RabbitApp.delete(
    //     "/room/:roomId/subscriber/:userId",
    //     RoomIdSubscriberIdController.delete
    // );
    //
    // RabbitApp.post("/room/:roomId/owner", RoomIdOwnerController.post);
    // RabbitApp.get("/room/:roomId/owner", RoomIdOwnerController.get);
}
module.exports = router;
