import { FileSystem } from "../../filesytem/disk"
import { User, UserFriends } from "../../modules/types";
import { requestEngine } from "../request";

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

                    let data = await requestEngine("/add_friends", user);
                
                    console.log("pubkey:", user.pubkey)
                    console.log("-> response:", data?.message)
                }
            } 
            catch {  }
        return true
    })

    let data = await requestEngine("/save", { scope: "friends" });

    console.log(data?.message)
}
