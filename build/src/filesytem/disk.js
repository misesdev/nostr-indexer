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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
const fs = require("fs");
const readline = require("readline");
class FileSystem {
    constructor(fileName) {
        this.read = readline;
        if (fileName.length < 2)
            throw Error("invalid file name");
        this.fileWrite = fs.createWriteStream(fileName, { flags: "a" });
        this.filePath = fileName;
    }
    writeLine(line) {
        this.fileWrite.write(`${line}\n`);
    }
    readLines(method) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            this.fileRead = fs.createReadStream(this.fileWrite.path);
            const readLine = this.read.createInterface({
                input: this.fileRead,
                crlfDelay: Infinity
            });
            try {
                for (var _d = true, readLine_1 = __asyncValues(readLine), readLine_1_1; readLine_1_1 = yield readLine_1.next(), _a = readLine_1_1.done, !_a; _d = true) {
                    _c = readLine_1_1.value;
                    _d = false;
                    let line = _c;
                    if (line) {
                        let success = yield method(line.toString());
                        if (!success)
                            break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = readLine_1.return)) yield _b.call(readLine_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            fs.writeFile(this.filePath, '', (error) => {
                if (error)
                    console.log(error);
                else
                    console.log("file cleared");
            });
        });
    }
}
exports.FileSystem = FileSystem;
