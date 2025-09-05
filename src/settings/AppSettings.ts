import FDisk from "../filesytem/FDisk";
import { Settings } from "./types";

class AppSettings 
{
    private readonly _file: FDisk
    constructor()
    {
        this._file = new FDisk("./settings.json")         
    }

    public get(): Settings
    {
        const json = this._file.readJson()
        return JSON.parse(json) as Settings
    }

    public set(settings: Settings): void
    {
        this._file.writeJson(settings)
    }
}

export default AppSettings


