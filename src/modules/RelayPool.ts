import { WebSocket } from "ws"
import { distinctEvent } from "../utils";
import { NostrFilter } from "./types/NostrFilter";
import { Settings } from "../settings/types";
import DBRelays from "../service/database/DBRelays";
import { NostrEvent } from "./types/NostrEvent";

export class RelayPool 
{
    private relays: string[];
    public websockets: WebSocket[];
    public timeout: number = 1800;
    private subscription: string = "3da9794398579582309458";

    constructor(relays: string[]) 
    {
        if(relays.length < 1)
            throw Error("expected relays");

        this.relays = relays; 
        this.websockets = [];
    }

    private async connectRelay(relay: string) : Promise<WebSocket> 
    {
        return new Promise((resolve, reject) => {
            let websock = new WebSocket(relay);
            websock.on("open", () => resolve(websock));
            websock.on("close", () => reject(`disconnected: ${relay}`))
            websock.on("error", () => reject(`not connetd: ${relay}`))

            setTimeout(() => {
                //websock.removeAllListeners("open");
                resolve(null)
            }, this.timeout)
        });
    }

    public async connect() 
    {
        console.log("connecting")

        let websockets = this.relays.map(relay => this.connectRelay(relay).catch(error => {
            console.log(error)
            return null;
        }))

        this.websockets = await Promise.all(websockets)

        this.websockets = this.websockets.filter(socket => socket != null)

        console.log("connected")
    }

    private async disconectRelay(websocket: WebSocket): Promise<void> {
        new Promise<void>((resolve) => {
            let timeout: any
            websocket.send(`[\"CLOSE\", ${this.subscription}]`)

            const handleMessage = (message: any) => {
                let data = JSON.parse(message.toString()); 

                if(data[0] == "EOSE") {
                    websocket.removeListener("message", handleMessage)
                    clearTimeout(timeout)
                    resolve()
                }
                
                websocket.on("message", handleMessage);

                timeout = setTimeout(() => {
                    websocket.removeListener("message", handleMessage)
                    resolve()
                }, this.timeout)
            }
        })
    }

    public async disconect() {
        let promises = this.websockets.map(websocket => this.disconectRelay(websocket))

        await Promise.all(promises)
    }

    private async fetchEventRelay(websocket: WebSocket, filter: NostrFilter): Promise<Event[]> 
    {
        return new Promise((resolve) => {
            let timeout: any;
            let events: Event[] = []
            // send the message
            websocket.send(`[
                "REQ", 
                "${this.subscription}", 
                ${JSON.stringify(filter)}
            ]`);
            
            // receive the event and return
            const handleMessage = (message: any) => {
                let data = JSON.parse(message.toString());            
                
                if(data[0] == "EVENT") {
                    let event: Event = data[2];
                    events.push(event);
                }
                
                if(data[0] == "EOSE") {
                    websocket.removeListener("message", handleMessage)
                    clearTimeout(timeout)
                    resolve(events)
                }
            }

            websocket.on("message", handleMessage)

            // remove the listener in timeout
            timeout = setTimeout(() => { 
                websocket.removeAllListeners("message")
                console.log(`timeout: ${websocket.url}`)
                resolve(events);
            }, this.timeout);
        });
    }

    public async fechEvents(filter: NostrFilter): Promise<NostrEvent[]> 
    {
        let eventPromises = this.websockets.map(async (websocket) => { 
            return this.fetchEventRelay(websocket, filter).catch((error:string) => {
                console.log(error)
                return [];
            })
        })

        let allEvents = await Promise.all(eventPromises)

        let events = allEvents.flat()

        return distinctEvent(events)
    }

    public async fechUser(pubkey: string): Promise<NostrEvent> 
    {
        let events = await this.fechEvents({
            kinds: [0],
            authors: [pubkey],
            limit: 1
        })
        if(events.length > 0) return events[0]
        return null
    }

    public static async getInstance(settings: Settings): Promise<RelayPool>
    {       
        let relays: string[] = settings.relays
        if(settings.current_page >= 10) 
        {
            let dbRelays = new DBRelays()
            relays = (await dbRelays.list(settings.relay_page, settings.relays_per_page))
                .map(r => r.url)
            // settings.relay_page += 1
            // AppSettings.save(settings)
        }
        const relayPool = new RelayPool(relays)
        await relayPool.connect()
        return relayPool
    }
}


