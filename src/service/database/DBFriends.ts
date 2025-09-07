import { Friend } from "../../modules/types/Friend";
import { User } from "../../modules/types/User";
import DBFactory from "./DBFactory";

class DBFriends
{
    private readonly _db: DBFactory;
    constructor() 
    {
        this._db = new DBFactory();
    }

    public async listFriends(user_pubkey: string): Promise<User[]> {
        const query = `
            SELECT f.friend_pubkey AS pubkey, u.*
            FROM friends f
            JOIN users u ON f.friend_pubkey = u.pubkey
            WHERE f.user_pubkey = $1
            ORDER BY u.display_name NULLS LAST, u.name NULLS LAST
        `;
        const result = await this._db.query<User>(query, [user_pubkey]);
        return result;
    }

    public async upsert(friends: Friend[]): Promise<void> 
    {
        if (!friends.length) return;

        const columns = ["user_pubkey", "friend_pubkey"];
        const values: any[] = [];
        const placeholders: string[] = [];
        friends.forEach((f, i) => {
            const baseIndex = i * columns.length;
            placeholders.push(
                `(${columns.map((_, j) => `$${baseIndex + j + 1}`).join(", ")})`
            );
            values.push(f.user_pubkey, f.friend_pubkey);
        });
        const query = `
            INSERT INTO friends (${columns.join(", ")})
            VALUES ${placeholders.join(", ")}
            ON CONFLICT (user_pubkey, friend_pubkey) DO NOTHING
        `;
        await this._db.exec(query, values);
    }

    public async remove(user_pubkey: string, friend_pubkey: string): Promise<void>
    {
        const query = `
            DELETE FROM friends
            WHERE user_pubkey = $1 AND friend_pubkey = $2
        `;
        await this._db.exec(query, [user_pubkey, friend_pubkey]);
    }
}

export default DBFriends;
