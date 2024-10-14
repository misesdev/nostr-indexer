import { FileSystem } from "../../filesytem/disk"
import { requestEngine } from "../request"

export const sendUsers = async (fileUsers: FileSystem) => {
    await fileUsers.readLines(async (line) => {
        try 
        {
            let data = await requestEngine("/add_user", JSON.parse(line))
                        
            console.log(data?.message)
        } 
        catch {  }

        return true
    })

    let data = await requestEngine("/save", { scope: "users" })

    console.log(data?.message)
}
