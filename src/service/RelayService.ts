import { NostrEvent } from "../modules/types/NostrEvent";
import { NostrRelay } from "../modules/types/NostrRelay";
import { distinct, getRelayDomain } from "../utils";
import DBRelays from "./database/DBRelays";
import axios, { AxiosInstance } from "axios"

class RelayService
{
    private readonly _dbRelays: DBRelays
    private readonly _httpClient: AxiosInstance
    constructor(
        dbRelays: DBRelays = new DBRelays()
    ) {
        this._dbRelays = dbRelays
        this._httpClient = axios.create({ 
            headers: { 
                Accept: "application/nostr+json"
            },
            timeout: 1500
        })
    }

    public static relaysFromEvent(event: NostrEvent): string[]
    {
        try {
            const relayUrls: string[] = []
            let eventRelays = JSON.parse(event.content);
            for(let relay in eventRelays) 
            {
                let relayDomain = getRelayDomain(relay)
                relayUrls.push(relayDomain)
            }
            return relayUrls 
        } catch {
            return[]
        }
    }

    public async saveRelays(relayUrls: string[]): Promise<void>
    {
        let betchSize = 30
        const distinctRelays = distinct(relayUrls)
        console.log("saving relays...:", distinctRelays.length)
        for(let i = 0; i < distinctRelays.length; i += betchSize)
        {
            const betch = distinctRelays.slice(i, i + betchSize)
            const promises = betch.map(url => this.loadRelay(url))
            const allRelays = await Promise.all(promises)
            await this._dbRelays.upsert(allRelays.flat())
            console.log("saved relays betch...:", betch.length)
        }
    }

    private async loadRelay(url: string): Promise<NostrRelay>
    {
        try {
            const response = await this._httpClient.get(url.replace("wss", "https"))
            if(response.status != 200)
                throw new Error(`unreachable relay ${url}`)
            console.log("reachable relay", url)
            return {
                url: url,
                name: response.data.name,
                pubkey: response.data.pubkey,
                description: response.data.description,
                contact: response.data.contact,
                supported_nips: JSON.stringify(response.data.supported_nips??[]),
                software: response.data.software,
                version: response.data.version,
                active: true, 
                ref_count: 1
            }
        }
        catch {
            console.log("unreachable relay", url)
            return { 
                url, 
                name: url,
                active: false, 
                ref_count: 1
            }
        }
    }
}

export default RelayService


