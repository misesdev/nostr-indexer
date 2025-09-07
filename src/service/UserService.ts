import { RelayPool } from "../modules/RelayPool";
import { NostrEvent } from "../modules/types/NostrEvent";
import { User } from "../modules/types/User";
import { Settings } from "../settings/types";
import { distinctUsers } from "../utils";
import DBUsers from "./database/DBUsers";

class UserService
{
    private readonly _settings: Settings
    private readonly _dbUsers: DBUsers
    constructor(
        settings: Settings,
        dbUsers: DBUsers = new DBUsers()
    ) {
        this._dbUsers = dbUsers
        this._settings = settings
    }

    public async loadUsers(pool: RelayPool, pubkeys: string[]): Promise<void>
    {
        let skipe = this._settings.max_fetch_events
        for (let i = 0; i <= pubkeys.length; i += skipe) 
        {
            let users: User[] = []
            let events = await pool.fechEvents({
                authors: pubkeys.slice(i, i + skipe),
                limit: skipe,
                kinds: [0]
            })

            console.log("profiles...:", events.length)

            for(let i = 0; i < events.length; i++) 
            {
                try 
                {
                    const user = this.userFromEvent(events[i])
                    users.push(user)
                } 
                catch {}
            }
            const distincts = distinctUsers(users)
            await this._dbUsers.upsert(distincts)
        }
    }

    private userFromEvent(event: NostrEvent): User 
    {
        let user: User = JSON.parse(event.content)
        
        if((!user.name && !user.display_name) || user["deleted"]) 
            throw new Error("invalid user")

        let properties = [
            "name", "pubkey", "display_name", "picture", "banner", "about", 
            "website", "nip05", "lud06", "lud16", "zapService"
        ]
        
        if(!user.display_name && user["displayName"])
            user.display_name = user["displayName"]
        if(!user.name && user.display_name)
            user.name = user.display_name
        if(!user.picture && user["profile"])
            user.picture = user["profile"]

        if(user.name.length >= 250)
            user.name = `${user.name.substring(0, 245)}...`
        if(user.display_name?.length >= 250)
            user.display_name = `${user.display_name.substring(0, 245)}...`
        if(user.picture?.length >= 512)
            user.picture = `${user.picture.substring(0, 508)}...`
        if(user.banner?.length >= 512)
            user.banner = `${user.banner.substring(0, 508)}...`
        if(user.website?.length >= 512)
            user.website = `${user.website.substring(0, 508)}...`
        if(user.nip05?.length >= 512)
            user.nip05 = `${user.nip05.substring(0, 508)}...`
        if(user.lud06?.length >= 512)
            user.lud06 = `${user.lud06.substring(0, 508)}...`
        if(user.lud16?.length >= 512)
            user.lud16 = `${user.lud16.substring(0, 508)}...`
        if(user.zapService?.length >= 512)
            user.zapService = `${user.zapService.substring(0, 508)}...`
    
        for (let property in user) {
            if(!properties.includes(property))
                delete user[property]
        }

        user.pubkey = event.pubkey

        return user
    }
}

export default UserService

