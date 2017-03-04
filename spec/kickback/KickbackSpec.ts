import Kickback from '../../index';
import TerrariaServer from 'dimensions/terrariaserver';
import Client from 'dimensions/client';
import * as Net from 'net';
import RoutingServer from 'dimensions/routingserver';
import ClientPacketHandler from 'dimensions/clientpackethandler';
import TerrariaServerPacketHandler from 'dimensions/terrariaserverpackethandler';
import ClientCommandHandler from 'dimensions/clientcommandhandler';
import {ConfigOptions} from 'dimensions/configloader';
import Logger from 'dimensions/logger';
import * as Mitm from 'mitm';

describe("Kickback", () => {
    let kickback: Kickback;
    let config: ConfigOptions;
    let mitm = new Mitm();
    let socket: Net.Socket;
    let fallbackServer: RoutingServer;
    let outsideServer: RoutingServer;
    let serversDetails;
    let globalHandlers;
    let servers;
    let globalTracking;
    let client: Client;
    let server: TerrariaServer;

    beforeEach(() => {
        mitm.on("connection", function(socket) { socket.write("Hello back!") });

        kickback = new Kickback();
        config = {
            socketTimeout: 0,
            currentTerrariaVersion: 0,
            fakeVersion: {
                enabled: false,
                terrariaVersion: 0
            },
            blacklist: {
                enabled: false,
                apiKey: ""
            },
            blockInvis: false,
            log: {
                clientBlocked: false,
                clientConnect: false,
                clientDisconnect: false,
                clientError: false,
                clientTimeouts: false,
                extensionLoad: false,
                outputToConsole: false,
                tServerConnect: false,
                tServerDisconnect: false,
                tServerError: false,
            },
            restApi: {
                enabled: false,
                port: 0
            }

        };

        socket = Net.connect(22, "example.org");
        outsideServer = {
            name: "outsideServer",
            serverIP: "localhost",
            serverPort: 7777
        };
        fallbackServer = {
            name: "fallbackServer",
            serverIP: "localhost",
            serverPort: 7778
        };

        serversDetails = {
            outsideServer: {
                clientCount: 0,
                disabled: false,
                disabledTimeout: null,
                failedConnAttempts: 0
            },
            fallbackServer: {
                clientCount: 0,
                disabled: false,
                disabledTimeout: null,
                failedConnAttempts: 0
            }
        };

        globalHandlers = {
            command: new ClientCommandHandler(),
            clientPacketHandler: new ClientPacketHandler(),
            terrariaServerPacketHandler: new TerrariaServerPacketHandler(),
            extensions: []
        };

        servers = {
            outsideServer: outsideServer,
            fallbackServer: fallbackServer
        };

        globalTracking = {
            names: {}
        };

        client = new Client(0, socket, outsideServer, serversDetails, globalHandlers, servers, config, globalTracking, new Logger());
        server = new TerrariaServer(socket, client);
    });

    it("should handle a disconnect when a user gets disconnected from an outside dimension", () => {
        expect(kickback.serverDisconnectPreHandler(client.server)).toBeTruthy();
    });

    it("should not handle a disconnect when a user gets disconnected from the fallbackServer", () => {
        // Must be used to avoid callback waiting for socket disconnect
        client.server.socket.destroyed = true;

        client.changeServer(fallbackServer);
        expect(kickback.serverDisconnectPreHandler(client.server)).toBeFalsy();
    });

    it("should send the user to the fallback server when disconnected from an outside dimension", () => {
        // Must be used to avoid callback waiting for socket disconnect
        client.server.socket.destroyed = true;
        kickback.serverDisconnectPreHandler(client.server);
        expect(client.server.name).toEqual(fallbackServer.name);
    });
});