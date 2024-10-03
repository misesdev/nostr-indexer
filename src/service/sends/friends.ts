import { FileSystem } from "../../filesytem/disk"
import { User, UserFriends } from "../../modules/types";

export const sendFriends = async (fileFriends: FileSystem) => {

    const pubkeys: string[] = []
    const filePubkeys: FileSystem = new FileSystem("./data/pubkeys.db")

    await filePubkeys.readLines(async (pubkey) => {
        pubkeys.push(pubkey)
        return true
    })

    await fileFriends.readLines(async (line) => {
        try 
            {
                let friends: string[] = []
                let userFriends: UserFriends = JSON.parse(line);

                if(userFriends.friends.length <= 0)
                    return true
                
                let user: User = { 
                    pubkey: userFriends.pubkey,
                    friends: []
                }
                
                userFriends.friends.forEach(index => {
                    let pubkey = pubkeys[index]
                    if(pubkey && pubkey.length == 64) 
                        friends.push(pubkey)
                })

                let interval = 100
                for(let i = 0; i < friends.length; i += interval) 
                {
                    user.friends = friends.slice(i, i + interval)

                    let response = await fetch(`${process.env.API_ENGINE_URL}/add_friends`, {
                        method: "post",
                        body: JSON.stringify(user)
                    })

                    let data = await response.json()
                
                    console.log("pubkey:", user.pubkey)
                    console.log("-> response:", data.message)
                }
            } 
            catch {  }
        return true
    })

    let response = await fetch(`${process.env.API_ENGINE_URL}/save`, {
        method: "post",
        body: JSON.stringify({
            scope: "friends"
        })
    })

    let data = await response.json()

    console.log(data?.message)
}
