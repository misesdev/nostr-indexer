import { RelayPool } from "../modules/RelayPool";
import { FileSystem } from "../filesytem/disk";
import { Event } from "../modules/types";
import { maxFetchEvents } from "../constants";
import { requestEngine } from "./request";

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
        user["profile"] = ""

    if(!user["about"])
        user["about"] = ""

    if(user["name"].length > 45)
        user["name"] = `${user["name"].substring(0, 41)}...`

    if(user["displayName"].length > 45)
        user["displayName"] = `${user["displayName"].substring(0, 41)}...`

    if(user["profile"].length > 149)
        user["profile"] = "" 

    if(!user["about"]) user["about"] = ""

    user["pubkey"] = event.pubkey

    for (let property in user) {
        if(!properties.includes(property))
            delete user[property]
    }

    return user;
}

export const listUsers = async (pool: RelayPool) => {
    
    const pubkeys: string[] = []

    const filePubkeys = new FileSystem("./data/pubkeys.db");

    await filePubkeys.readLines(async (line) => { 
        if(line.length == 64) pubkeys.push(line) 
        return true;
    })

    console.log("total pubkey:", pubkeys.length)

    let skipe = maxFetchEvents, totalUsers = 0
    for (let i = 0; i <= pubkeys.length; i += skipe) 
    {
        let authors = pubkeys.slice(i, i + skipe)

        let events = await pool.fechEvents({
            authors: authors,
            limit: skipe,
            kinds: [0]
        })

        for(let i = 0; i < events.length; i++) 
        {
            let event = events[i]

            try 
            {
                let data = await requestEngine("/add_user", sanitiseUser(event))

                console.log(data?.message)

                totalUsers++;
            } catch {}
        }
    }

    console.log("found users:", totalUsers)

    let response = await requestEngine("/save", {
        scope: "users"
    })

    console.log(response?.message)    
}


