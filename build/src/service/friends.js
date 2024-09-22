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
exports.listFriends = void 0;
const disk_1 = require("../filesytem/disk");
const utils_1 = require("../utils");
const listFriends = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    const pubkeys = [];
    const fileFriends = new disk_1.FileSystem("./data/friends.db");
    const filePubkeys = new disk_1.FileSystem("./data/pubkeys.db");
    yield filePubkeys.readLines((pubkey) => __awaiter(void 0, void 0, void 0, function* () {
        pubkeys.push(pubkey);
        return true;
    }));
    fileFriends.clear();
    let skipe = 300, countUsers = 0;
    for (let i = 0; i < pubkeys.length; i += skipe) {
        let events = yield pool.fechEvents({
            authors: pubkeys.slice(i, i + skipe),
            limit: skipe,
            kinds: [3]
        });
        if (events.length) {
            events.forEach(event => {
                try {
                    let npubs = (0, utils_1.getPubkeys)(event);
                    let friends = npubs.map(npub => pubkeys.indexOf(npub));
                    let user = {
                        pubkey: event.pubkey,
                        friends: friends
                    };
                    fileFriends.writeLine(JSON.stringify(user));
                    console.log("npubs:", npubs.length);
                    countUsers++;
                }
                catch (_a) { }
            });
        }
    }
    console.log("loaded friends:", countUsers);
    console.log("pubkeys:", pubkeys.length);
});
exports.listFriends = listFriends;
