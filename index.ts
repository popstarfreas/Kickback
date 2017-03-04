import PacketTypes from 'dimensions/packettypes';
import * as Net from 'net';
import TerrariaServer from 'dimensions/terrariaserver';
import Packet from 'dimensions/packet';
import PacketReader from 'dimensions/packets/packetreader';
import Client from 'dimensions/client';
import {Extension, ServerDisconnectHandler} from 'dimensions/extension';
import {Config, ConfigSettings} from './configloader';
import {requireNoCache} from 'dimensions/utils';

class Kickback implements Extension {
    name: string;
    version: string;
    author: string;
    reloadable: boolean;
    reloadName: string;
    config: ConfigSettings;

    constructor() {
        this.name = "Kickback";
        this.version = "v1.0";
        this.author = "popstarfreas";
        this.reloadable = true;
        this.reloadName = "reloadkickback";
        this.config = Config;
    }

    reload(require): void {
        this.config = requireNoCache('./extensions/kickback/config.js', require);
    }

    serverDisconnectPreHandler(server: TerrariaServer): boolean {
        let handled = false;

        // Only switch if not already in the fallback Dimension
        if (this.config.enabled && server.name !== this.config.dimensionKickbackName) {
            if (this.config.kickbackMessageEnabled) {
                server.client.sendChatMessage(this.config.kickbackMessage, this.config.kickbackColor);
            }
            server.client.changeServer(server.client.servers[this.config.dimensionKickbackName]);
            server.client.wasKicked = false;
            handled = true;
        }
        return handled;
    }
}

export default Kickback;