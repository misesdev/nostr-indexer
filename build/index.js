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
const RelayPool_1 = require("./src/modules/RelayPool");
const Relays_1 = require("./src/constants/Relays");
const pubkeys_1 = require("./src/service/pubkeys");
const users_1 = require("./src/service/users");
const up_data_1 = require("./src/service/up-data");
const friends_1 = require("./src/service/friends");
const author = "55472e9c01f37a35f6032b9b78dade386e6e4c57d80fd1d0646abb39280e5e27";
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const relayPool = new RelayPool_1.RelayPool(Relays_1.relays);
    yield relayPool.connect();
    yield (0, pubkeys_1.listPubkeys)(relayPool, author, true);
    yield (0, users_1.listUsers)(relayPool);
    yield (0, friends_1.listFriends)(relayPool);
    yield (0, up_data_1.loadData)();
});
main();
