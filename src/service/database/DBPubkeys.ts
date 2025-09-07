import DBFactory from "./DBFactory"

class DBPubkeys
{
    private readonly _db: DBFactory
    constructor() {
        this._db = new DBFactory()
    }

    public async list(page: number, items: number): Promise<string[]>
    {
        let pageSize = items, offset = 0//page * items;
        const query = `
            SELECT pubkey 
            FROM pubkeys 
            ORDER BY pubkey 
            LIMIT $1 OFFSET $2
        `
        const result = await this._db.query<any>(query, [pageSize, offset])
        return result.map(p => p.pubkey)
    }

    public async upsert(pubkeys: string[]): Promise<void>
    {
        if(!pubkeys.length) return;
        const values: any[] = [];
        const placeholders = pubkeys.map((key, i) => {
            values.push(key);
            return `($${i + 1})`;
        });
        const query = `
            INSERT INTO pubkeys (pubkey)
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (pubkey)
            DO UPDATE SET ref_count = pubkeys.ref_count + 1
        `;
        await this._db.exec(query, values);
    }
}

export default DBPubkeys

