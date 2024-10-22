import { maxFetchEvents, maxUsersPubkeys } from "../constants";
import { FileSystem } from "../filesytem/disk";
import { RelayPool } from "../modules/RelayPool";
import { distinctPubkeys, getPubkeys } from "../utils";
import { requestEngine } from "./request";
import { getRelayDomain } from "../utils";

type Props = {
    pool: RelayPool,
    author: string 
}

export const listPubkeys = async ({ pool, author }: Props) => {
    
    var pubkeys: string[] = []
    const filePubkeys = new FileSystem("./data/pubkeys.db")

    await filePubkeys.readLines(async (pubkey) => {
        pubkeys.push(pubkey)
        return true
    })

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

        for(let i = 0; i < events.length; i++)
        {
            let event = events[i]
            let npubs = getPubkeys(event)
            console.log("npubs...:", npubs.length)

            npubs.forEach(pubkey => { 
                if(!pubkeys.includes(pubkey))
                    pubkeys.push(pubkey)
            })

            try {
                let eventRelays = JSON.parse(event.content);
                
                for(let relay in eventRelays) 
                {
                    let relayDomain = getRelayDomain(relay)

                    let response = await requestEngine("/add_relay", { 
                        relay: relayDomain
                    })

                    console.log(response?.message)
                }
            } 
            catch { }
        }

        if(pubkeys.length > maxPubkeys) break
    }

    await filePubkeys.clear()

    pubkeys = distinctPubkeys(pubkeys)

    pubkeys.forEach(pubkey => filePubkeys.writeLine(pubkey))

    console.log("users pubkeys:", pubkeys.length)   

    let response = await requestEngine("/save", {
        scope: "relays"
    })

    console.log(response?.message)
}
