import { FileSystem } from "../../filesytem/disk"
import { requestEngine } from "../request"

export const getRelayDomain = (relay: string) => {
    
    const url = new URL(relay)

    if(!url.hostname.includes(".") || url.hostname.length <= 2)
        throw Error("Invalid relay domain")

    return `${url.protocol}//${url.hostname}`
}

export const sendRelays = async (fileRelays: FileSystem) => {
    
    await fileRelays.readLines(async (line: string) => {
        try 
        {
            let relay = getRelayDomain(line)

            let data = await requestEngine("/add_relay", { relay });

            console.log("send relay:", line.trim())
            console.log("response ->", data?.message)
        }
        catch { return true }
        
        return true
    })

    let data = await requestEngine("/save", { scope: "relays" })

    console.log("response ->", data.message);
}
