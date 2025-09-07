import { NostrEvent } from "./modules/types/NostrEvent";
import { User } from "./modules/types/User";

export const getPubkeys = (event: NostrEvent): string[] => {
    let pubkeys = event.tags.map((tag: any) => { 
        // if not have a value
        if(!!!tag[1]) return null;
        // if not have a pubkey value
        if(tag[1].length < 64) return null;
        if(tag[1].includes(":")) {
            tag[1] = tag[1]
                .substring(tag[1].indexOf(":") + 1, 
                    tag[1].lastIndexOf(":"))
        } 
        return tag[1];
    });
    return pubkeys.filter((f: string) => {
        return f != null && f?.length == 64
    })
}

export const distinctEvent = (events: NostrEvent[]) => {
    return events.filter((event, index, self) => {
        return index == self.findIndex(x => x.id == event.id)
    })
}

export const distinctUsers = (users: User[]): User[] => {
    const seen = new Map<string, User>();
    for (const user of users) {
        seen.set(user.pubkey, user);
    }
    return Array.from(seen.values());
}

export const distinct = (pubkeys: string[]) => {
    return pubkeys.filter((pubkey, index, self) => {
        return index == self.indexOf(pubkey)
    })
}

export const getRelayDomain = (relay: string) => {
    const url = new URL(relay)
    if(!url.hostname.includes(".") || url.hostname.length <= 2)
        throw Error("Invalid relay domain")
    return `${url.protocol}//${url.hostname}`
}


