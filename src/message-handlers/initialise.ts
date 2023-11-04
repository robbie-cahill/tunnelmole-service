import InitialiseMessage from '../messages/initialise-message';
import HostipWebSocket from '../websocket/host-ip-websocket';
import HostnameAssignedMessage from '../messages/hostname-assigned-message';
import config from '../../config';
import Proxy from '../proxy';
import HostnameAlreadyTakenMessage from '../messages/hostname-already-taken';
import InvalidSubscriptionMessage from '../messages/invalid-subscription-message';
import addClientLog from '../metrics/add-client-log';
import { bannedClientIds } from '../../security/banned-client-ids';
import { INDEX_OF_NOT_FOUND } from '../../constants';
import { bannedIps } from '../../security/banned-ips';
import { bannedHostnames } from '../../security/banned-hostnames';
import ReservedDomain from '../model/reserved-domain';
import { addReservedDomain } from '../repository/reserved-subdomain-repository';
import { DOMAIN_ALREADY_RESERVED, ERROR, SUCCESS, TOO_MANY_DOMAINS, reserveDomain } from '../reserved-domain/reserved-domain';
import DomainAlreadyReserved from '../messages/domain-already-reserved';
import TooManyDomains from '../messages/domain-reservation-error';
import DomainReservationError from '../messages/domain-reservation-error';
import { authorize } from '../authentication/authorize';
const randomstring = require("randomstring");

const RANDOM_SUBDOMAIN_LENGTH = 6;

const { verify } = require('reverse-dns-lookup');

export default async function initialise(message: InitialiseMessage, websocket: HostipWebSocket) {
    let validSubscription = false;
    if (typeof message.apiKey === 'string') {
        validSubscription = await authorize(message.apiKey);

        if (!validSubscription) {
            const invalidSubscriptionMessage : InvalidSubscriptionMessage = {
                type: "invalidSubscription",
                apiKey: message.apiKey
            }

            websocket.sendMessage(invalidSubscriptionMessage);
        }
    }

    if (typeof message.apiKey !== 'string' && message.subdomain) {
            const invalidSubscriptionMessage : InvalidSubscriptionMessage = {
            type: "invalidSubscription",
            apiKey: null
        }

        websocket.sendMessage(invalidSubscriptionMessage);
    }

    // By default use a random subdomain unless the subscription is valid and a subdomain is passed
    let subdomain = generateRandomSubdomain(websocket);
    if (validSubscription && typeof message.subdomain === 'string') {
        const reservedDomain: ReservedDomain = {
            apiKey: message.apiKey,
            subdomain: message.subdomain
        };

        // Reserve and set the requested domain, or send back a message in case of failure
        const result = await reserveDomain(reservedDomain);
        switch (result) {
            case TOO_MANY_DOMAINS:
                const tooManyDomains: TooManyDomains = {
                    type: "tooManyDomains",
                    subdomain
                }

                websocket.sendMessage(tooManyDomains);
                break;
            case DOMAIN_ALREADY_RESERVED:
                const domainAlreadyReservedMessage: DomainAlreadyReserved = {
                    type: "domainAlreadyReserved",
                    subdomain: message.subdomain,
                }

                websocket.sendMessage(domainAlreadyReservedMessage);
                break;
            case SUCCESS:
                subdomain = message.subdomain;
                break;
            case ERROR:
                const domainReservationError: DomainReservationError = {
                    type: "domainReservationError",
                    subdomain
                }

                websocket.sendMessage(domainReservationError);
                break;
        }
    }

    const clientId = message.clientId;
    const hostname = subdomain + '.' + config.server.domain

    let isBannedHostname;
    
    try {
        isBannedHostname = await verify(websocket.ipAddress, ...bannedHostnames);
    } catch (error) {
        // Sometimes hostnames fail to be looked up, ignore this error
        isBannedHostname = false;
    }

    // "Shadow ban" banned client ids and banned ip addresses
    if (isBannedHostname || bannedClientIds.indexOf(clientId) !== INDEX_OF_NOT_FOUND || bannedIps.indexOf(websocket.ipAddress) !== INDEX_OF_NOT_FOUND) {
        // Make this service look like its working, when in fact its not
        const fakeHostnameAssignedMessage: HostnameAssignedMessage = {
            type: 'hostnameAssigned',
            hostname
        }

        websocket.sendMessage(fakeHostnameAssignedMessage);

        setTimeout(() => {
            websocket.close();
        }, 43200000);

        return;
    }

    // Add websocket to proxy connections for future web requests to use
    const proxy = Proxy.getInstance();

    // Check for an existing connection for this hostname
    // If there is an existing connection for this hostname and the client id matches the one passed by the client, replace the websocket with the new one
    // if there is an existing connection for this hostname but the client id does not match, send back a hostnameAlreadyTaken message
    const existingConnection = proxy.findConnectionByHostname(hostname);
    if (typeof existingConnection == 'undefined') {
        await addClientLog(clientId, "initialized", hostname);
        proxy.addConnection(hostname, websocket, clientId);
    } else if (existingConnection.clientId === clientId) { // Consider using api key instead to establish subdomain ownership?
        proxy.replaceWebsocket(hostname, websocket);
    } else {
        const hostnameAlreadyTaken : HostnameAlreadyTakenMessage = {
            type: 'hostnameAlreadyTaken',
            hostname
        };

        websocket.sendMessage(hostnameAlreadyTaken);
    }

    const hostnameAssignedMessage : HostnameAssignedMessage = {
        type: 'hostnameAssigned',
        hostname
    }

    websocket.sendMessage(hostnameAssignedMessage);

    console.info("Websocket connection initialised for client id" + message.clientId);
}

const generateRandomSubdomain = (websocket: HostipWebSocket) : string => {
    const randomString : string = randomstring.generate(RANDOM_SUBDOMAIN_LENGTH);
    let subdomain = randomString.toLowerCase();
    const ipTransformed = websocket.ipAddress.replace(/\./g, '-');
    subdomain = subdomain + '-ip-' + ipTransformed;
    return subdomain;
}