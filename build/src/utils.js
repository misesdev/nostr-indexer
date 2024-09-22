"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinctPubkeys = exports.distinctEvent = exports.getPubkeys = void 0;
const getPubkeys = (event) => {
    let pubkeys = event.tags.map((tag) => {
        // if not have a value
        if (!!!tag[1])
            return null;
        // if not have a pubkey value
        if (tag[1].length < 64)
            return null;
        if (tag[1].includes(":")) {
            tag[1] = tag[1]
                .substring(tag[1].indexOf(":") + 1, tag[1].lastIndexOf(":"));
        }
        return tag[1];
    });
    return pubkeys.filter((f) => f != null);
};
exports.getPubkeys = getPubkeys;
const distinctEvent = (events) => {
    return events.filter((event, index, self) => {
        return index == self.findIndex(x => x.pubkey == event.pubkey);
    });
};
exports.distinctEvent = distinctEvent;
const distinctPubkeys = (pubkeys) => {
    return pubkeys.filter((pubkey, index, self) => {
        return index == self.indexOf(pubkey);
    });
};
exports.distinctPubkeys = distinctPubkeys;
