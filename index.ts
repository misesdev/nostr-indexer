import { RelayPool } from "./src/modules/RelayPool";
import PubkeyService from "./src/service/PubkeyService";
import AppSettings from "./src/settings/AppSettings";
// import { listUsers } from "./src/service/users";
// import { listFriends } from "./src/service/friends";
import { configDotenv } from "dotenv";

configDotenv()

const main = async () => {

    const settings = AppSettings.get()

    const relayPool = await RelayPool.getInstance(settings)

    // Carrega as chaves publicas
    const pubkeyService = new PubkeyService(settings)
    await pubkeyService.loadPubkeys(relayPool)

    // await listUsers(relayPool)

    // await listFriends(relayPool)

    await relayPool.disconect()

    process.exit(0)
}

main()



