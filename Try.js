// const sequelize = require("./libs/sequelize");
// const room = require("./models/Room").Room;
// const user = require("./models/User").User;
//
//
//
// async function main(){
//     let foundRoom = await room.createRoom("her","her","1599523488",1);
//     try {
//         await foundRoom.subscribe("2");
//         await foundRoom.subscribe("3");
//         await foundRoom.subscribe("4");
//         await foundRoom.unsubscribe("1");
//         let rooms = await room.getRooms("2", "0");
//         return await rooms[0].getJSON();
//     } catch (e){
//         console.log(e);
//         throw e
//     }
// }
// sequelize.sync().then(main).then(console.log).catch(console.log);

// class RabbitHandler {
//     constructor(handler = () => {
//     }) {
//         this._handlers = [handler];
//     }
//
//     handle = (sendFunc) => {
//         return (msg) => {
//             msg.send = this.prepareSend(sendFunc,msg);
//             msg.next = this.prepareNext(msg);
//             this._handlers[msg.handleId](msg);
//         }
//     }
//
//     prepareNext(msg){
//         msg.handleId = 0;
//         return ()=>{
//             msg.handleId++;
//             if(msg.handleId>=this.handlerSize()){
//                 msg.send();
//             } else {
//                 this._handlers[msg.handleId](msg);
//             }
//         }
//
//     }
//
//     prepareSend(sendFunc,msg){
//         return (...args) => {
//             this.clearMessage(msg);
//             sendFunc.apply(null,args);
//         }
//     }
//
//
//     push(handler) {
//         this._handlers.push(handler);
//     }
//
//     handlerSize(){
//         return this._handlers.length;
//     }
//
//     clearMessage(msg) {
//         delete msg.handleId;
//         delete msg.next;
//         delete msg.send;
//     }
//
// }
//
//
// class Logger{
//     constructor(){
//         this.x = "hueplet";
//     }
//
//     log(...args){
//         console.log(args,this.x);
//     }
// }
//
// let handler = new RabbitHandler((msg)=>{
//      msg.content+=" her";
//      msg.next();
// })
//
// handler.push((msg)=>{
//     msg.content+=" hui";
//     msg.next();
// })
//
//
// handler.push((msg)=>{
//     msg.content+=" zalupa"
//     msg.next();
// })
//
//
// handler.push((msg)=>{
//     msg.content+=" pinus";
//     msg.send(msg,"koni");
// })
//
// let logger = new Logger();
//
// handler.handle(logger.log.bind(logger))({content:"123"});

