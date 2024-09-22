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
exports.listPubkeys = void 0;
const disk_1 = require("../filesytem/disk");
const utils_1 = require("../utils");
const listPubkeys = (pool_1, author_1, ...args_1) => __awaiter(void 0, [pool_1, author_1, ...args_1], void 0, function* (pool, author, listRelays = false) {
    var relays = [];
    var pubkeys = [];
    const filePubkeys = new disk_1.FileSystem("./data/pubkeys.db");
    const fileRelays = new disk_1.FileSystem("./data/relays.db");
    filePubkeys.readLines((pubkey) => __awaiter(void 0, void 0, void 0, function* () {
        pubkeys.push(pubkey);
        return true;
    }));
    if (listRelays) {
        fileRelays.readLines((relay) => __awaiter(void 0, void 0, void 0, function* () {
            relays.push(relay);
            return true;
        }));
    }
    if (pubkeys.length <= 0) {
        const events = yield pool.fechEvents({
            authors: [author],
            kinds: [3],
            limit: 1
        });
        if (events.length)
            (0, utils_1.getPubkeys)(events[0]).forEach(pubkey => pubkeys.push(pubkey));
    }
    let skipe = 300, maxPubkeys = 1070000;
    for (let i = 0; i < pubkeys.length; i += skipe) {
        let authors = pubkeys.slice(i, i + skipe);
        let events = yield pool.fechEvents({
            authors: authors,
            kinds: [3],
            limit: skipe
        });
        events.forEach(event => {
            let npubs = (0, utils_1.getPubkeys)(event);
            console.log("npubs", npubs.length);
            npubs.forEach(pubkey => {
                if (!pubkeys.includes(pubkey))
                    pubkeys.push(pubkey);
            });
            if (listRelays) {
                try {
                    let eventRelays = JSON.parse(event.content);
                    for (let relay in eventRelays) {
                        if (!relays.includes(relay))
                            relays.push(relay);
                    }
                }
                catch (_a) {
                    console.log("error to list relays");
                }
            }
        });
        if (pubkeys.length > maxPubkeys)
            break;
    }
    yield filePubkeys.clear();
    pubkeys = (0, utils_1.distinctPubkeys)(pubkeys);
    pubkeys.forEach(pubkey => filePubkeys.writeLine(pubkey));
    console.log("users pubkeys:", pubkeys.length);
    if (listRelays) {
        yield fileRelays.clear();
        relays = (0, utils_1.distinctPubkeys)(relays);
        relays.forEach(relay => fileRelays.writeLine(relay));
        console.log('relays:', relays.length);
    }
});
exports.listPubkeys = listPubkeys;
