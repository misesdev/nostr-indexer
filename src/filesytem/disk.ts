import * as fs from 'fs'
import * as readline from 'readline';

export class FileSystem {
    
    private filePath: string;
    private fileWrite: fs.WriteStream;
    private fileRead: fs.ReadStream;
    private read = readline;

    constructor(fileName: string) {
        if(fileName.length < 2) 
            throw Error("invalid file name")

        this.fileWrite = fs.createWriteStream(fileName, { flags: "a" });
        this.filePath = fileName;
    }
 
    public writeLine(line: string) {
        this.fileWrite.write(`${line}\n`)
    }
    
    public async readLines(method: (line: string) => Promise<boolean>) {
        
        this.fileRead = fs.createReadStream(this.fileWrite.path);

        const readLine = this.read.createInterface({
            input: this.fileRead,
            crlfDelay: Infinity
        })

        for await (let line of readLine) {
            if(line) { 
                let success = await method(line.toString())
                if(!success) break;
            }
        }
    }

    public async clear() {
        fs.writeFile(this.filePath, '', (error) => {
            if(error)
                console.log(error)
            else
                console.log("file cleared")
        })
    }
}

