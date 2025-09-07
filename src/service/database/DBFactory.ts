import { Pool } from "pg"

class DBFactory
{
    private readonly _db: Pool
    constructor() 
    {
        this._db = new Pool({
            host: process.env.DB_HOST,    
            port: parseInt(process.env.DB_PORT??"5432"),          
            user: process.env.DB_USERNAME,  
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        })
    }

    public async query<Entity>(query: string, params: any[]): Promise<Entity[]>
    {
        try 
        {
            const result = await this._db.query<Entity>(query, params)
            return result.rows
        } catch(ex) {
            console.log(ex)
            return []
        }
    }

    public async exec(query: string, params: any[]): Promise<void>
    {
        try
        {
            await this._db.query(query, params)
        } catch(ex) {
            console.log(ex)
        }
    }
}

export default DBFactory
