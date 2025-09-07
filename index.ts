import { RelayPool } from "./src/modules/RelayPool";
import PubkeyService from "./src/service/PubkeyService";
import UserService from "./src/service/UserService";
import AppSettings from "./src/settings/AppSettings";
import { configDotenv } from "dotenv";

configDotenv()

const runIndexer = async () => {

    const settings = AppSettings.get()

    const relayPool = await RelayPool.getInstance(settings)
    
    const pubkeys = await PubkeyService.currentPubkeys(settings)

    // load pubkeys, friends pubkeys and relays
    const pubkeyService = new PubkeyService(settings)
    await pubkeyService.loadPubkeys(relayPool, pubkeys)

    // load users from pubkeys
    const userService = new UserService(settings)
    await userService.loadUsers(relayPool, pubkeys)

    await relayPool.disconect()

    process.exit(0)
}

export default runIndexer



