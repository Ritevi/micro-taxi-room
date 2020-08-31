router = function (router) {
    const RoomController = require("../controllers/Room");
    const RoomIdController = require("../controllers/RoomId");
    const RoomIdSubscriberController = require("../controllers/RoomIdSubscriber");
    const RoomIdSubscriberIdController = require("../controllers/RoomIdSubscriberId");
    const RoomIdOwnerController = require("../controllers/RoomIdOwner");

    router.get("/room", RoomController.get);
    router.post("/room", RoomController.post);

    router.get("/room/:roomId", RoomIdController.get);
    router.delete("/room/:roomId", RoomIdController.delete);

    router.post(
        "/room/:roomId/subscriber",
        RoomIdSubscriberController.post
    );
    router.get("/room/:roomId/subscriber", RoomIdSubscriberController.get);
    router.delete(
        "/room/:roomId/subscriber/:userId",
        RoomIdSubscriberIdController.delete
    );

    router.post("/room/:roomId/owner", RoomIdOwnerController.post);
    router.get("/room/:roomId/owner", RoomIdOwnerController.get);
}
module.exports = router;
