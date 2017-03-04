export interface ConfigSettings {
    enabled: boolean;
    dimensionKickbackName: string;
    kickbackMessageEnabled: boolean;
    kickbackMessage: string;
    kickbackColor: string;
}


export const Config: ConfigSettings = require(`../translator-config.js`);