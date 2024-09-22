import { RelayPool } from "../modules/RelayPool";
import { FileSystem } from "../filesytem/disk";
import { UserFriends } from "../modules/types";
import { getPubkeys } from "../utils";

export const listFriends = async (pool: RelayPool) =>
{
    const pubkeys: string[] = []
    const fileFriends = new FileSystem("./data/friends.db")
    const filePubkeys = new FileSystem("./data/pubkeys.db")

    await filePubkeys.readLines(async (pubkey) => {
        pubkeys.push(pubkey)
        return true
    })

    fileFriends.clear()

    let skipe = 300, countUsers = 0
    for(let i = 0; i < pubkeys.length; i += skipe) 
    {
        let events = await pool.fechEvents({
            authors: pubkeys.slice(i, i + skipe),
            limit: skipe,
            kinds: [3]
        })

        if(events.length) 
        {
            events.forEach(event => {
                try 
                {
                    let npubs = getPubkeys(event)
                    let friends = npubs.map(npub => pubkeys.indexOf(npub))

                    let user: UserFriends = {
                        pubkey: event.pubkey,
                        friends: friends
                    }

                    fileFriends.writeLine(JSON.stringify(user))
                    console.log("npubs:", npubs.length)
                    countUsers++;
                } catch {}
            })
        }
    }

    console.log("loaded friends:", countUsers);
    console.log("pubkeys:", pubkeys.length);
}
