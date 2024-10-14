import { maxFetchEvents, maxUsersPubkeys } from "../constants";
import { FileSystem } from "../filesytem/disk";
import { RelayPool } from "../modules/RelayPool";
import { distinctPubkeys, getPubkeys } from "../utils";
import { getRelayDomain } from "./sends/relays";

type Props = {
    pool: RelayPool,
    author: string, 
    listRelays: boolean
}

export const listPubkeys = async ({ pool, author, listRelays = false }: Props) => {
    
    var relays: string[] = []
    var pubkeys: string[] = []
    const filePubkeys = new FileSystem("./data/pubkeys.db")
    const fileRelays = new FileSystem("./data/relays.db")

    await filePubkeys.readLines(async (pubkey) => {
        pubkeys.push(pubkey)
        return true
    })

    if(listRelays) {
        await fileRelays.readLines(async (relay) => {
            relays.push(relay)
            return true
        })
    }

    if(pubkeys.length <= 0) {
        const events = await pool.fechEvents({
            authors: [author],
            kinds: [3],
            limit: 1
        })

        if(events.length) 
            getPubkeys(events[0]).forEach(pubkey => pubkeys.push(pubkey))
    }

    let skipe = maxFetchEvents, maxPubkeys = maxUsersPubkeys

    for(let i = 0; i < pubkeys.length; i += skipe) 
    {
        let authors = pubkeys.slice(i, i + skipe)
        
        let events = await pool.fechEvents({
            authors: authors,
            kinds: [3],
            limit: skipe
        })

        events.forEach(event => {
            let npubs = getPubkeys(event)
            console.log("npubs...:", npubs.length)

            npubs.forEach(pubkey => { 
                if(!pubkeys.includes(pubkey))
                    pubkeys.push(pubkey)
            })

            if(listRelays) 
            {
                try {
                    let eventRelays = JSON.parse(event.content);
                    
                    for(let relay in eventRelays) 
                    {
                        try
                        {
                            let relayDomain = getRelayDomain(relay)

                            if(!relays.includes(relayDomain))
                                relays.push(relayDomain)
                        } catch { }
                    }
                } 
                catch { }
            }
        })

        if(pubkeys.length > maxPubkeys) break
    }

    await filePubkeys.clear()

    pubkeys = distinctPubkeys(pubkeys)

    pubkeys.forEach(pubkey => filePubkeys.writeLine(pubkey))

    console.log("users pubkeys:", pubkeys.length)    

    if(listRelays) 
    {
        await fileRelays.clear()

        relays = distinctPubkeys(relays)

        relays.forEach(relay => fileRelays.writeLine(relay))

        console.log('relays..:', relays.length)
    }
}
