import FDisk from "../filesytem/FDisk";
import { Settings } from "./types";

class AppSettings 
{
    public static get(): Settings
    {
        let file = new FDisk("./settings.json")
        const json = file.readJson()
        return JSON.parse(json) as Settings
    }

    public static save(settings: Settings): void
    {
        let file = new FDisk("./settings.json")
        file.writeJson(settings)
    }
}

export default AppSettings


