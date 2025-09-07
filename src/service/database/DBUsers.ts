import { User } from "../../modules/types/User";
import DBFactory from "./DBFactory"

class DBUsers
{
    private readonly _db: DBFactory
    constructor() {
        this._db = new DBFactory()
    }

    public async list(page: number, items: number): Promise<User[]>
    {
        let pageSize = items, offset = page * items;
        const query = `
            SELECT * 
            FROM users 
            WHERE active = 1 
            ORDER BY url 
            LIMIT $1 OFFSET $2
        `
        const result = await this._db.query<User>(query, [pageSize, offset])
        return result
    }

    public async upsert(users: User[]): Promise<void>
    {
        if(!users.length) return;

        const columns = [
            "pubkey", "name", "display_name", "picture", "about",
            "banner", "website", "nip05", "lud06", "lud16", "zap_service" 
        ];
        const values: any[] = [];
        const placeholders: string[] = [];
        users.forEach((user, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(
                user.pubkey,
                user.name ?? null,
                user.display_name ?? null,
                user.picture ?? null,
                user.about ?? null,
                user.banner ?? null,
                user.website ?? null,
                user.nip05 ?? null,
                user.lud06 ?? null,
                user.lud16 ?? null,
                user.zapService ?? null,
            )
        })
        const query = `
            INSERT INTO users (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (pubkey)
            DO UPDATE SET
                name = EXCLUDED.name,
                display_name = EXCLUDED.display_name,
                picture = EXCLUDED.picture,
                about = EXCLUDED.about,
                banner = EXCLUDED.banner,
                website = EXCLUDED.website,
                nip05 = EXCLUDED.nip05,
                lud06 = EXCLUDED.lud06,
                lud16 = EXCLUDED.lud16,
                zap_service = EXCLUDED.zap_service
        `;
        await this._db.exec(query, values);
    }
}

export default DBUsers
