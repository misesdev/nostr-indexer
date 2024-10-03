import { FileSystem } from "../../filesytem/disk"

export const sendUsers = async (fileUsers: FileSystem) => {
    await fileUsers.readLines(async (line) => {
        try 
        {
            let response = await fetch(`${process.env.API_ENGINE_URL}/add_user`, {
                method: "post",
                body: line,
            })
            
            let data = await response.json()
            
            console.log(data.message)

            if(!response.ok) 
                console.log(data)
        } 
        catch {  }

        return true
    })

    let response = await fetch(`${process.env.API_ENGINE_URL}/save`, {
        method: "post",
        body: JSON.stringify({
            scope: "users"
        })
    })

    let data = await response.json()

    console.log(data?.message)
}
