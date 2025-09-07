import { RelayPool } from "../modules/RelayPool";
import AppSettings from "../settings/AppSettings";
import { Settings } from "../settings/types";
import { distinct, getPubkeys } from "../utils";
import DBPubkeys from "./database/DBPubkeys";
import FriendsService from "./FriendsService";
import RelayService from "./RelayService";

class PubkeyService
{
    private readonly _settings: Settings
    private readonly _dbPubkeys: DBPubkeys
    private readonly _relayService: RelayService
    private readonly _friendService: FriendsService
    constructor(
        settings: Settings,
        dbPubkeys: DBPubkeys = new DBPubkeys(),
        relayService: RelayService = new RelayService(),
        friendService: FriendsService = new FriendsService()
    ) {
        this._dbPubkeys = dbPubkeys
        this._relayService = relayService 
        this._friendService = friendService
        this._settings = settings
    }

    public async loadPubkeys(pool: RelayPool, pubkeys: string[]): Promise<void>
    {
        let relayUrls: string[] = []
        // se chegar nas ultimas pubkeys encontradas reinicia o ciclo
        if(pubkeys.length > 1 && pubkeys.length < this._settings.items_per_page) 
            AppSettings.save({ ...this._settings, current_page: 1 })

        if(pubkeys.length == 1)
            await this._dbPubkeys.upsert(distinct(pubkeys))            

        let skipe = this._settings.max_fetch_events

        console.log(`varrendo ${pubkeys.length} pubkeys..`)
        for(let i = 0; i < pubkeys.length; i += skipe) 
        {
            let events = await pool.fechEvents({
                authors: pubkeys.slice(i, i + skipe),
                kinds: [3],
                limit: skipe
            })

            for(let i = 0; i < events.length; i++)
            {
                let event = events[i]
                let npubs = getPubkeys(event)
                console.log("npubs...:", npubs.length)

                await this._dbPubkeys.upsert(distinct(npubs))
                await this._friendService.saveFriends(event.pubkey, distinct(npubs))

                let urls = RelayService.relaysFromEvent(event)
                if(urls.length)
                    relayUrls.push(...urls)
            }
        }
        await this._relayService.saveRelays(relayUrls)
    }

    public static async currentPubkeys(settings: Settings): Promise<string[]>
    {
        const dbPubkeys = new DBPubkeys()

        const pubkeys = await dbPubkeys
            .list(settings.current_page, settings.items_per_page)
        
        if(pubkeys.length >= settings.items_per_page) 
        {
            settings.current_page += 1
            AppSettings.save(settings)
        }
        
        if (!pubkeys.length)
            return  [settings.initial_user]
        
        return pubkeys
    }
}

export default PubkeyService
