const amqp = require('amqplib');
const EventEmitter = require('events');
const uuid = require('uuid');

class RabbitMQApp{
    REPLY_QUEUE = 'amq.rabbitmq.reply-to';
    constructor(options) {
        this._rpcStart = false;
        this._consumeHandlers = new Map();
        this._connection = {};
        amqp.connect(options)
            .then(conn => {
                this._connection = conn;
                return conn.createChannel()
            })
            .then(channel => {
                this._channel = channel;
            });

    }

    startRPC = ()=>{
        this._rpcStart = true
        this._channel.responseEmitter = new EventEmitter();
        this._channel.responseEmitter.setMaxListeners(0);
        this._channel.consume(
            this.REPLY_QUEUE,
            msg => {
                this._channel.responseEmitter.emit(
                    msg.properties.correlationId,
                    msg.content.toString('utf8'),
                );
            },
            { noAck: true },
        );
    }

    sendRPCMessage = (message, rpcQueue) => {
        if (this._rpcStart == false) this.startRPC();

        return new Promise(resolve => {
            let msg = JSON.stringify(message);
            const correlationId = uuid.v4();
            this._channel.responseEmitter.once(correlationId, resolve);
            this._channel.sendToQueue(rpcQueue, Buffer.from(msg), {
                correlationId,
                replyTo: this.REPLY_QUEUE,
            });
        });
    }

    consumeRPC(queue,handl){
        this.use(queue,handl);
        let handler = this.getHandler(queue);
        let handlerFunc = handler.handle(this._channel);
        this._channel.consume(queue,handlerFunc);

    }

    //add use in consume rpc

    use(queue,handler){
        if(this.hasHandler(queue)){
            this.getHandler(queue).push(handler);
        } else {
            this._channel.assertQueue(queue,{
                durable: true
            });
            this._consumeHandlers.set(queue, new RabbitHandler(handler));
        }
    }

    hasHandler(queue){
        return !!this._consumeHandlers.get(queue);
    }

    getHandler(queue){
        return this.hasHandler(queue)?this._consumeHandlers.get(queue): new Error("this handler does not exist");
    }

}


class RabbitHandler {
    constructor(handler = () => {
    }) {
        this._handlers = [handler];
    }

    handle = (channel) => {
        return (msg) => { // create my msg
            msg.handleId=0;
            msg.next = this.prepareNext(channel,msg);
            this._handlers[msg.handleId](channel,msg);
        }
    }

    prepareNext(channel,msg){
        return ()=>{
            msg.handleId++;
            if(msg.handleId>=this.handlerSize()){
                new Error("no more handlers exist");
            } else {
                this._handlers[msg.handleId](channel,msg);
            }
        }

    }


    push(handler) {
        this._handlers.push(handler);
    }

    handlerSize(){
        return this._handlers.length;
    }

    clearMessage(msg) {
        delete msg.handleId;
        delete msg.next;
        delete msg.send;
    }

}







module.exports = RabbitMQApp