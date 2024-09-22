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
exports.loadData = void 0;
const disk_1 = require("../filesytem/disk");
const loadData = () => __awaiter(void 0, void 0, void 0, function* () {
    const pubkeys = [];
    const fileUsers = new disk_1.FileSystem("./data/users.db");
    const fileFriends = new disk_1.FileSystem("./data/friends.db");
    const filePubkeys = new disk_1.FileSystem("./data/pubkeys.db");
    yield filePubkeys.readLines((pubkey) => __awaiter(void 0, void 0, void 0, function* () {
        pubkeys.push(pubkey);
        return true;
    }));
    // // send users
    yield fileUsers.readLines((line) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let response = yield fetch("http://localhost:8080/add_user", {
                method: "post",
                body: line,
            });
            let data = yield response.json();
            console.log(data.message);
            if (!response.ok)
                console.log(data);
        }
        catch (_a) { }
        return true;
    }));
    let response = yield fetch("http://localhost:8080/save", {
        method: "post"
    });
    let data = yield response.json();
    console.log(data.message);
    // send friends
    yield fileFriends.readLines((line) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let friends = [];
            let userFriends = JSON.parse(line);
            if (userFriends.friends.length <= 0)
                return true;
            let user = {
                pubkey: userFriends.pubkey,
                friends: []
            };
            userFriends.friends.forEach(index => {
                let pubkey = pubkeys[index];
                if (pubkey && pubkey.length == 64)
                    friends.push(pubkey);
            });
            let interval = 100;
            for (let i = 0; i < friends.length; i += interval) {
                user.friends = friends.slice(i, i + interval);
                let response = yield fetch("http://localhost:8080/add_friends", {
                    method: "post",
                    body: JSON.stringify(user)
                });
                let data = yield response.json();
                console.log("pubkey:", user.pubkey);
                console.log("-> response:", data.message);
            }
        }
        catch (_a) { }
        return true;
    }));
    response = yield fetch("http://localhost:8080/save", {
        method: "post"
    });
    data = yield response.json();
    console.log(data.message);
});
exports.loadData = loadData;
