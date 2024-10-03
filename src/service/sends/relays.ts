import { FileSystem } from "../../filesytem/disk"

export const getRelayDomain = (relay: string) => {
    
    const url = new URL(relay)

    if(!url.hostname.includes("."))
        throw Error("Invalid relay domain")

    return `${url.protocol}//${url.hostname}`
}

export const sendRelays = async (fileRelays: FileSystem) => {
    
    await fileRelays.readLines(async (line: string) => {
        try 
        {
            let relay = getRelayDomain(line)

            let response = await fetch(`${process.env.API_ENGINE_URL}/add_relay`, {
                method: "post",
                body: JSON.stringify({
                    relay: relay
                })
            }) 

            let data = await response.json()

            console.log("send relay:", line.trim())
            console.log("response ->", data.message)
        }
        catch { return true }
        
        return true
    }) 

    let response = await fetch(`${process.env.API_ENGINE_URL}/save`, {
        method: "post",
        body: JSON.stringify({
            scope: "relays"
        })
    }) 

    console.log("request save data")

    let data = await response.json()

    console.log("response ->", data.message);
}
