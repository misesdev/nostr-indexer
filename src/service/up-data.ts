import { FileSystem  } from "../filesytem/disk";
import { sendFriends } from "./sends/friends";
import { sendUsers } from "./sends/users";
import { sendRelays } from "./sends/relays";

type Props = {
    users: boolean,
    friends: boolean,
    relays: boolean
}

export const loadData = async ({ 
    users = true, 
    friends = true,
    relays = true
}: Props) => {
    
    // send users
    if(users) 
    {
        const fileUsers = new FileSystem("./data/users.db")
        await sendUsers(fileUsers)  
    }

    // send friends
    if(friends) 
    {
        const fileFriends = new FileSystem("./data/friends.db")
        await sendFriends(fileFriends)
    }
    
    if(relays) 
    {
        const fileRelays = new FileSystem("./data/relays.db")
        await sendRelays(fileRelays)
    }
}




