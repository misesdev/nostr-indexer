import { Event } from "./modules/types"

export const getPubkeys = (event: Event): string[] => {
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

    return pubkeys.filter((f: string) => f != null)
}

export const distinctEvent = (events: Event[]) => {
    return events.filter((event, index, self) => {
        return index == self.findIndex(x => x.pubkey == event.pubkey)
    })
}

export const distinctPubkeys = (pubkeys: string[]) => {
    return pubkeys.filter((pubkey, index, self) => {
        return index == self.indexOf(pubkey)
    })
}


