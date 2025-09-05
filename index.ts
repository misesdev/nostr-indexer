import { RelayPool } from "./src/modules/RelayPool";
import AppSettings from "./src/settings/AppSettings";
import { listPubkeys } from "./src/service/pubkeys";
import { listUsers } from "./src/service/users";
import { listFriends } from "./src/service/friends";
import { configDotenv } from "dotenv";

configDotenv()

const main = async () => {

    const _appSettings = new AppSettings()

    const settings = _appSettings.get()

    const relayPool = new RelayPool(settings.relays)

    await relayPool.connect();

    await listPubkeys({ 
        pool: relayPool, 
        author: settings.initial_user 
    }) 

    await listUsers(relayPool)

    await listFriends(relayPool)

    await relayPool.disconect()

    // increment the page of pubkeys to the next execution
    settings.current_page += 1
   
    // save the settings
    _appSettings.set(settings)

    return;
}

main();



