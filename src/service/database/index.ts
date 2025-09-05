import { Client } from "pg"

class BBFactory
{
    private readonly _db: Client;
    constructor() 
    {
        this._db = new Client({
            host: process.env.DB_HOST,    
            port: parseInt(process.env.DB_PORT??"5432"),          
            user: process.env.DB_USER,  
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        })
    }

    public async query<Entity>(query: string, params: any[]): Promise<Entity[]>
    {
        try 
        {
            await this._db.connect()
            const result = await this._db.query<Entity>(query, params)
            await this._db.end()
            return result.rows
        } catch(ex) {
            console.log(ex)
            return []
        }
    }

    public async exec(query: string, params: any[]): Promise<void>
    {
        try {
            await this._db.connect()
            await this._db.query(query, params)
            await this._db.end()
        } catch(ex) {
            console.log(ex)
        }
    }
}

export default BBFactory
