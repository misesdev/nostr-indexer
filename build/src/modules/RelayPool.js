"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayPool = void 0;
const ws_1 = require("ws");
const utils_1 = require("../utils");
class RelayPool {
    constructor(relays) {
        this.timeout = 1500;
        this.subscription = "3da9794398579582309458d6f1498";
        if (relays.length < 1)
            throw Error("expected relays");
        this.relays = relays;
        this.websockets = [];
    }
    connectRelay(relay) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let websock = new ws_1.WebSocket(relay);
                websock.on("open", () => resolve(websock));
                websock.on("close", () => reject(`not connetd: ${relay}`));
                websock.on("error", () => reject(`not connetd: ${relay}`));
                setTimeout(() => {
                    //websock.removeAllListeners("open");
                    resolve(null);
                }, this.timeout);
            });
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("connecting");
            let websockets = this.relays.map(relay => this.connectRelay(relay).catch(error => {
                console.log(error);
                return null;
            }));
            this.websockets = yield Promise.all(websockets);
            this.websockets = this.websockets.filter(socket => socket != null);
            console.log("connected");
        });
    }
    fetchEventRelay(websocket, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let timeout;
                let events = [];
                // send the message
                websocket.send(`[
                "REQ", 
                "${this.subscription}", 
                ${JSON.stringify(filter)}
            ]`);
                // receive the event and return
                const handleMessage = (message) => {
                    let data = JSON.parse(message.toString());
                    if (data[0] == "EVENT") {
                        let event = data[2];
                        events.push(event);
                    }
                    if (data[0] == "EOSE") {
                        websocket.removeListener("message", handleMessage);
                        clearTimeout(timeout);
                        resolve(events);
                    }
                };
                websocket.on("message", handleMessage);
                // remove the listener in timeout
                timeout = setTimeout(() => {
                    websocket.removeAllListeners("message");
                    console.log(`timeout: ${websocket.url}`);
                    resolve(events);
                }, this.timeout);
            });
        });
    }
    fechEvents(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let eventPromises = this.websockets.map((websocket) => __awaiter(this, void 0, void 0, function* () {
                return this.fetchEventRelay(websocket, filter).catch((error) => {
                    console.log(error);
                    return [];
                });
            }));
            let allEvents = yield Promise.all(eventPromises);
            let events = allEvents.flat();
            return (0, utils_1.distinctEvent)(events);
        });
    }
    fechUser(pubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            let events = yield this.fechEvents({
                kinds: [0],
                authors: [pubkey],
                limit: 1
            });
            if (events.length > 0)
                return events[0];
            return null;
        });
    }
}
exports.RelayPool = RelayPool;
