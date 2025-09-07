import { NostrRelay } from "../../modules/types/NostrRelay";
import DBFactory from "./DBFactory"

class DBRelays
{
    private readonly _db: DBFactory
    constructor() {
        this._db = new DBFactory()
    }

    public async list(page: number, items: number): Promise<NostrRelay[]>
    {
        let pageSize = items, offset = page * items;
        const query = `
            SELECT * 
            FROM relays 
            WHERE active = 1 
            ORDER BY url 
            LIMIT $1 OFFSET $2
        `
        const result = await this._db.query<NostrRelay>(query, [pageSize, offset])
        return result
    }

    public async upsert(relays: NostrRelay[]): Promise<void>
    {
        if(!relays.length) return;
        const columns = [
            "url", "name", "pubkey", "description", "contact",
            "supported_nips", "software", "version", "active", "ref_count"
        ];
        const values: any[] = [];
        const placeholders: string[] = [];
        relays.forEach((relay, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(
                relay.url,
                relay.name,
                relay.pubkey,
                relay.description,
                relay.contact,
                relay.supported_nips,
                relay.software,
                relay.version,
                relay.active,
                relay.ref_count ?? 1
            );
        });
        const query = `
            INSERT INTO relays (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (url)
            DO UPDATE SET
                name = EXCLUDED.name,
                pubkey = EXCLUDED.pubkey,
                description = EXCLUDED.description,
                contact = EXCLUDED.contact,
                supported_nips = EXCLUDED.supported_nips,
                software = EXCLUDED.software,
                version = EXCLUDED.version,
                active = EXCLUDED.active,
                ref_count = relays.ref_count + 1
        `;
        await this._db.exec(query, values);
    }
}

export default DBRelays
