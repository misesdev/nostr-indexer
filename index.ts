import { RelayPool } from "./src/modules/RelayPool";
import { relays } from "./src/constants/Relays";
import { listPubkeys } from "./src/service/pubkeys";
import { listUsers } from "./src/service/users";
import { loadData } from "./src/service/up-data";
import { listFriends } from "./src/service/friends";

const author: string = "55472e9c01f37a35f6032b9b78dade386e6e4c57d80fd1d0646abb39280e5e27";

const main = async () => {

    const relayPool = new RelayPool(relays)

    await relayPool.connect();

    await listPubkeys(relayPool, author, true) 

    await listUsers(relayPool)

    await listFriends(relayPool)

    await loadData()
}

main();


