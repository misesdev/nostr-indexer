import { RelayPool } from "../modules/RelayPool";
import { FileSystem } from "../filesytem/disk";
import { Event } from "../modules/types";

const defaultProfile = "https://blob.nostroogle.org/files/storage/ec362271f59dbc624ae0c9654/hczhqsKU5okwFDpeASqhNKwYykBGP1ne1QvtGGCR.png";

type User = {
    name: string,
    displayName: string,
    profile: string,
    about: string,
    pubkey: string
}

const sanitiseUser = (event: Event): User => {

    let user : User = JSON.parse(event.content)

    let properties = ["name", "displayName", "profile", "about", "pubkey"]

    if((!user["name"] && !user["display_name"]) || user["deleted"]) 
        throw new Error("invalid user")

    if(!user["name"] && user["display_name"])
        user["name"] = user["display_name"]

    if(!user["display_name"] && user["name"])
        user["display_name"] = user["name"]

    if(!user['displayName']) 
        user["displayName"] = user["display_name"]

    if(user["name"].length <= 3 && user["displayName"].length <= 3)
        throw new Error("invalid username")

    if(!user["profile"] && user["picture"]) 
        user["profile"] = user["picture"]

    if(!user["picture"]) 
        user["profile"] = defaultProfile

    if(!user["about"])
        user["about"] = ""

    if(user["name"].length > 45)
        user["name"] = `${user["name"].substring(0, 41)}...`

    if(user["displayName"].length > 45)
        user["displayName"] = `${user["displayName"].substring(0, 41)}...`

    if(user["profile"].length > 149)
        user["profile"] = defaultProfile

    // if(user["about"] && user["about"].length > 180)
    //     user["about"] = `${user["about"].substring(0, 176)}...`

    // if(user["about"].length >= 178)
    //     user["about"] = user["about"].replace(/\\u[0-9A-Fa-f]*\.{3}$/, '...')

    user["pubkey"] = event.pubkey

    for(let property in user) {
        if(!properties.includes(property))
            delete user[property]
    }

    return user;
}

export const listUsers = async (pool: RelayPool) => {
    
    const pubkeys: string[] = []

    const fileUsers = new FileSystem("./data/users.db");
    const filePubkeys = new FileSystem("./data/pubkeys.db");

    await filePubkeys.readLines(async (line) => { 
        pubkeys.push(line) 
        return true;
    })

    await fileUsers.clear()

    let skipe = 500, totalUsers = 0
    for (let i = 0; i <= pubkeys.length; i += skipe) 
    {
        let authors = pubkeys.slice(i, i + skipe)

        let events = await pool.fechEvents({
            authors: authors,
            limit: skipe,
            kinds: [0]
        })

        console.log("events:", events.length);

        events.forEach(event => {
            try {
                let user = sanitiseUser(event)

                fileUsers.writeLine(JSON.stringify(user))

                totalUsers++;
            } catch {}
        });
    }

    console.log("found users:", totalUsers)
}


