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
exports.listUsers = void 0;
const disk_1 = require("../filesytem/disk");
const defaultProfile = "https://blob.nostroogle.org/files/storage/ec362271f59dbc624ae0c9654/hczhqsKU5okwFDpeASqhNKwYykBGP1ne1QvtGGCR.png";
const sanitiseUser = (event) => {
    let user = JSON.parse(event.content);
    let properties = ["name", "displayName", "profile", "about", "pubkey"];
    if ((!user["name"] && !user["display_name"]) || user["deleted"])
        throw new Error("invalid user");
    if (!user["name"] && user["display_name"])
        user["name"] = user["display_name"];
    if (!user["display_name"] && user["name"])
        user["display_name"] = user["name"];
    if (!user['displayName'])
        user["displayName"] = user["display_name"];
    if (user["name"].length <= 3 && user["displayName"].length <= 3)
        throw new Error("invalid username");
    if (!user["profile"] && user["picture"])
        user["profile"] = user["picture"];
    if (!user["picture"])
        user["profile"] = defaultProfile;
    if (!user["about"])
        user["about"] = "";
    if (user["name"].length > 45)
        user["name"] = `${user["name"].substring(0, 41)}...`;
    if (user["displayName"].length > 45)
        user["displayName"] = `${user["displayName"].substring(0, 41)}...`;
    if (user["profile"].length > 149)
        user["profile"] = defaultProfile;
    // if(user["about"] && user["about"].length > 180)
    //     user["about"] = `${user["about"].substring(0, 176)}...`
    // if(user["about"].length >= 178)
    //     user["about"] = user["about"].replace(/\\u[0-9A-Fa-f]*\.{3}$/, '...')
    user["pubkey"] = event.pubkey;
    for (let property in user) {
        if (!properties.includes(property))
            delete user[property];
    }
    return user;
};
const listUsers = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    const pubkeys = [];
    const fileUsers = new disk_1.FileSystem("./data/users.db");
    const filePubkeys = new disk_1.FileSystem("./data/pubkeys.db");
    yield filePubkeys.readLines((line) => __awaiter(void 0, void 0, void 0, function* () {
        pubkeys.push(line);
        return true;
    }));
    yield fileUsers.clear();
    let skipe = 500, totalUsers = 0;
    for (let i = 0; i <= pubkeys.length; i += skipe) {
        let authors = pubkeys.slice(i, i + skipe);
        let events = yield pool.fechEvents({
            authors: authors,
            limit: skipe,
            kinds: [0]
        });
        console.log("events:", events.length);
        events.forEach(event => {
            try {
                let user = sanitiseUser(event);
                fileUsers.writeLine(JSON.stringify(user));
                totalUsers++;
            }
            catch (_a) { }
        });
    }
    console.log("found users:", totalUsers);
});
exports.listUsers = listUsers;
