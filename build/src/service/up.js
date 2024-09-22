"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadData = void 0;
const disk_1 = require("../filesytem/disk");
const loadData = () => {
    const fileUsers = new disk_1.FileSystem("users.db");
    fileUsers.readLines(line => {
        let user = JSON.parse(line);
        console.log(user);
        //fetch("localhost:9090/loadUser", user)
    });
};
exports.loadData = loadData;
