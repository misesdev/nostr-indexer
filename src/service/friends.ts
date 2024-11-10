import { RelayPool } from "../modules/RelayPool";
import { UserFriends } from "../modules/types";
import { FileSystem } from "../filesytem/disk";
import { getPubkeys } from "../utils";
import { requestEngine } from "./request";
import { maxFetchEvents } from "../constants";

export const listFriends = async (pool: RelayPool) =>
{
    const pubkeys: string[] = []

    const filePubkeys = new FileSystem("./data/pubkeys.db");

    await filePubkeys.readLines(async (line) => { 
        if(line.length == 64) pubkeys.push(line) 
        return true;
    })

    let skipe = maxFetchEvents, countFriends = 0
    for (let i = 0; i <= pubkeys.length; i += skipe) 
    {
        let authors = pubkeys.slice(i, i + skipe)
    
        let events = await pool.fechEvents({
            authors: authors,
            limit: skipe,
            kinds: [3]
        })

        for(let i = 0; i < events.length; i++)
        {
            try 
            {
                let user: UserFriends = {
                    pubkey: events[i].pubkey,
                    friends: getPubkeys(events[i])
                }

                let response = await requestEngine("/add_friends", user)

                console.log(response?.message)

                countFriends++;
            } catch {}
        }
    }

    console.log("loaded friends..:", countFriends);

    let response = await requestEngine("/save", {
        scope: "friends"
    })

    console.log(response?.message)
}
