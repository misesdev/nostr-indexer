import * as fs from 'fs'

class FDisk 
{
    private filePath: string
    constructor(fileName: string) 
    {
        if(fileName.length < 2) 
            throw Error("invalid file name")
        this.filePath = fileName
    }

    public readJson(): string 
    {
        try {
            const data = fs.readFileSync(this.filePath, "utf-8")
            return data
        } catch (err) {
            console.error(err)
            return "";
        }
    }

    public writeJson<Entity>(data: Entity)
    {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8")
        } catch (err) {
            console.error(err)
        }
    }
}

export default FDisk
