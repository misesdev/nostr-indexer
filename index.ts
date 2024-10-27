import { RelayPool } from "./src/modules/RelayPool";
import { relays } from "./src/constants/Relays";
import { listPubkeys } from "./src/service/pubkeys";
import { listUsers } from "./src/service/users";
import { listFriends } from "./src/service/friends";
import { configDotenv } from "dotenv";

configDotenv()

const author: string = "55472e9c01f37a35f6032b9b78dade386e6e4c57d80fd1d0646abb39280e5e27";

const main = async () => {

    const relayPool = new RelayPool(relays)

    await relayPool.connect();

    await listPubkeys({ 
        pool: relayPool, 
        author: author 
    }) 

    await listUsers(relayPool)

    await listFriends(relayPool)

    await relayPool.disconect()

    return;
}

main();



