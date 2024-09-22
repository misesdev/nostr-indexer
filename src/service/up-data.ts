import { FileSystem  } from "../filesytem/disk";
import { User, UserFriends } from "../modules/types";

export const loadData = async () => {
    
    const pubkeys: string[] = []
    const fileUsers = new FileSystem("./data/users.db")
    const fileFriends = new FileSystem("./data/friends.db")
    const filePubkeys = new FileSystem("./data/pubkeys.db")

    await filePubkeys.readLines(async (pubkey) => {
        pubkeys.push(pubkey)
        return true
    })

    // // send users
    await fileUsers.readLines(async (line) => {        
        try 
        {
            let response = await fetch("http://localhost:8080/add_user", {
                method: "post",
                body: line,
            })
            
            let data = await response.json()
            
            console.log(data.message)

            if(!response.ok) console.log(data)
        } 
        catch {  }

        return true
    })

    let response = await fetch("http://localhost:8080/save", {
        method: "post"
    })

    let data = await response.json()

    console.log(data.message)

    // send friends
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

                let response = await fetch("http://localhost:8080/add_friends", {
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

    response = await fetch("http://localhost:8080/save", {
        method: "post"
    })

    data = await response.json()

    console.log(data.message)
}




