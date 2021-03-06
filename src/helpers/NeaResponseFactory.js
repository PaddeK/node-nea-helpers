'use strict';

const
    path = require('path'),
    debug = require('debug')(__filename.split(path.sep).pop()),
    NymiApi = require('./NymiApi'),
    KeyTypeInfo = require('./../models/KeyTypeInfo'),
    NapiInitInfo = require('../models/NapiInitInfo'),
    NymiBandInfo = require('./../models/NymiBandInfo'),
    ProvisionInfo = require('./../models/ProvisionInfo'),
    NapiConfigInfo = require('./../models/NapiConfigInfo'),
    NotificationInfo = require('./../models/NotificationInfo'),
    NeaResponse = require('./NeaResponse'),
    InitResponse = require('./../responses/InitResponse'),
    TotpResponse = require('./../responses/TotpResponse'),
    InfoResponse = require('./../responses/InfoResponse'),
    RandomResponse = require('./../responses/RandomResponse'),
    CdfAuthResponse = require('./../responses/CdfAuthResponse'),
    SignatureResponse = require('./../responses/SignatureResponse'),
    KeyDeleteResponse = require('./../responses/KeyDeleteResponse'),
    ProvisionsChangedEvent = require('./../events/ProvisionsChangedEvent'),
    NotificationResponse = require('./../responses/NotificationResponse'),
    SymmetricKeyResponse = require('./../responses/SymmetricKeyResponse'),
    RoamingAuthSigResponse = require('./../responses/RoamingAuthSigResponse'),
    AcknowledgementResponse = require('./../responses/AcknowledgementResponse'),
    CdfRegistrationResponse = require('./../responses/CdfRegistrationResponse'),
    RoamingAuthSetupResponse = require('./../responses/RoamingAuthSetupResponse'),
    BaseEvent = require('../events/BaseEvent'),
    PatternEvent = require('./../events/PatternEvent'),
    FoundChangeEvent = require('./../events/FoundChangeEvent'),
    ProvisionedEvent = require('./../events/ProvisionedEvent'),
    GeneralErrorEvent = require('./../events/GeneralErrorEvent'),
    PresenceChangeEvent = require('./../events/PresenceChangeEvent'),
    RoamingAuthNonceEvent = require('./../events/RoamingAuthNonceEvent');

class NeaResponseFactory
{
    /**
     * Parse Napi response
     * @param {string} message
     * @constructor
     */
    static parse (message)
    {
        let ack, event,
            res = null,
            response = NeaResponse.parse(message);

        debug('Creating response for raw message: %s', message);

        switch (response.operation[0]) {
            case 'info':
                if (response.operation[1] === 'get') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createInfoResponse(ack, response.response);
                }
                break;
            case 'init':
                if (response.operation[1] === 'get') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createInitResponse(ack, response.response);
                }
                break;
            case 'notifications':
                if (response.operation[1] === 'get' || response.operation[1] === 'set') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createNotificationResponse(ack, response.response);
                } else if (response.operation[1] === 'report') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    event = NeaResponseFactory._createBaseEvent(ack, response.event);

                    switch (response.operation[2]) {
                        case 'found-change':
                        case 'presence-change':
                            res = NeaResponseFactory._createFoundChangeEvent(event, response.event);

                            if (response.operation[2] === 'presence-change') {
                                res = NeaResponseFactory._createPresenceChangeEvent(res, response.event);
                            }
                            break;
                        case 'general-error':
                            res = NeaResponseFactory._createGeneralErrorEvent(event, response.event);
                            break;
                    }
                }
                break;
            case 'key':
                if (response.operation[1] === 'delete') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createKeyDeleteResponse(ack, response.response);
                }
                break;
            case 'buzz':
            case 'revoke':
                if (response.operation[1] === 'run') {
                    res = NeaResponseFactory._createAcknowledgementResponse(response);
                }
                break;
            case 'sign':
                if (response.operation[1] === 'run') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createSignatureResponse(ack, response.response);
                } else if (response.operation[1] === 'setup') {
                    res = NeaResponseFactory._createAcknowledgementResponse(response);
                }
                break;
            case 'random':
                if (response.operation[1] === 'run') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createRandomResponse(ack, response.response);
                }
                break;
            case 'totp':
                ack = NeaResponseFactory._createAcknowledgementResponse(response);

                if (response.operation[1] === 'get') {
                    res = NeaResponseFactory._createTotpResponse(ack, response.response);
                } else if (response.operation[1] === 'run') {
                    res = ack;
                }
                break;
            case 'symmetricKey':
                ack = NeaResponseFactory._createAcknowledgementResponse(response);

                if (response.operation[1] === 'get') {
                    res = NeaResponseFactory._createSymmetricKeyResponse(ack, response.response);
                } else if (response.operation[1] === 'run') {
                    res = ack;
                }
                break;
            case 'cdf':
                ack = NeaResponseFactory._createAcknowledgementResponse(response);

                if (response.operation[1] === 'run') {
                    res = NeaResponseFactory._createCdfRegistrationResponse(ack, response.response);
                } else if (response.operation[1] === 'get') {
                    res = NeaResponseFactory._createCdfAuthResponse(ack, response.response);
                }
                break;
            case 'provision':
                ack = NeaResponseFactory._createAcknowledgementResponse(response);

                if (['provision/run/start', 'provision/run/stop', 'provision/pattern'].includes(response.path)) {
                    res = ack;
                } else if (response.path === 'provision/report/patterns') {
                    event = NeaResponseFactory._createBaseEvent(ack, response.event);
                    res = NeaResponseFactory._createPatternEvent(event, response.event);
                } else if (response.path === 'provision/report/provisioned') {
                    event = NeaResponseFactory._createBaseEvent(ack, response.event);
                    res = NeaResponseFactory._createProvisionedEvent(event, response.event);
                }
                break;
            case 'provisions':
                if (response.operation [1] === 'changed') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    event = NeaResponseFactory._createBaseEvent(ack, response.event);
                    res = NeaResponseFactory._createProvisionsChangedEvent(event, response.response);
                }
                break;
            case 'roaming-auth-setup':
                if (response.operation[1] === 'run') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createRoamingAuthSetupResponse(ack, response.response);
                }
                break;
            case 'roaming-auth':
                if (response.operation[1] === 'run') {
                    res = NeaResponseFactory._createAcknowledgementResponse(response);
                } else if (response.operation[1] === 'report') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    event = NeaResponseFactory._createBaseEvent(ack, response.event);
                    res = NeaResponseFactory._createRoamingAuthNonceEvent(event, response.event);
                }
                break;
            case 'roaming-auth-sig':
                if (response.operation[1] === 'run') {
                    ack = NeaResponseFactory._createAcknowledgementResponse(response);
                    res = NeaResponseFactory._createRoamingAuthSigResponse(ack, response.response);
                }
                break;
        }

        return res;
    }

    /**
     * Create ProvisionsChangedResponse
     * @param {BaseEvent} event
     * @param {object} info
     * @type {object}
     * @property {string} provisions
     * @return {ProvisionsChangedEvent}
     * @private
     */
    static _createProvisionsChangedEvent (event, info)
    {
        return new ProvisionsChangedEvent(event, info.provisions);
    }

    /**
     * Create RoamingAuthSetupResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} RAKey
     * @property {string} RAKeyId
     * @return {RoamingAuthSetupResponse}
     * @private
     */
    static _createRoamingAuthSetupResponse (acknowledgement, info)
    {
        return new RoamingAuthSetupResponse(acknowledgement, info.RAKey, info.RAKeyId)
    }

    /**
     * Create RoamingAuthSigResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} nymibandSig
     * @property {string} raKeyId
     * @return {RoamingAuthSigResponse}
     * @private
     */
    static _createRoamingAuthSigResponse (acknowledgement, info)
    {
        return new RoamingAuthSigResponse(acknowledgement, info.nymibandSig, info.raKeyId);
    }

    /**
     * Create RoamingAuthNonceEvent
     * @param {BaseEvent} event
     * @param {object} info
     * @type {object}
     * @property {string} nymibandNonce
     * @return {RoamingAuthNonceEvent}
     * @private
     */
    static _createRoamingAuthNonceEvent (event, info)
    {
        return new RoamingAuthNonceEvent(event, info.nymibandNonce);
    }

    /**
     * Create PatternEvent
     * @param {BaseEvent} event
     * @param {object} info
     * @type {object}
     * @property {string[]} patterns
     * @return {PatternEvent}
     * @private
     */
    static _createPatternEvent (event, info)
    {
        return new PatternEvent(event, info.patterns);
    }

    /**
     * Create ProvisionedEvent
     * @param {BaseEvent} event
     * @param {object} info
     * @type {object}
     * @property {object} info
     * @return {ProvisionedEvent}
     * @private
     */
    static _createProvisionedEvent (event, info)
    {
        let provInfo = NeaResponseFactory._createProvisionInfo(info.info);
        return new ProvisionedEvent(event, NeaResponseFactory._createNymiBandInfo(info.info, provInfo));
    }

    /**
     * Create CdfRegistrationResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} authenticationKey
     * @property {string} deviceKey
     * @return {CdfRegistrationResponse}
     * @private
     */
    static _createCdfRegistrationResponse (acknowledgement, info)
    {
        return new CdfRegistrationResponse(acknowledgement, info.authenticationKey, info.deviceKey);
    }

    /**
     * Create CdfAuthResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} deviceKeyHMAC
     * @property {string} sessionKeyHMAC
     * @return {CdfAuthResponse}
     * @private
     */
    static _createCdfAuthResponse (acknowledgement, info)
    {
        return new CdfAuthResponse(acknowledgement, info.deviceKeyHMAC, info.sessionKeyHMAC);
    }

    /**
     * Create TotpResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} totp
     * @return {TotpResponse}
     * @private
     */
    static _createTotpResponse (acknowledgement, info)
    {
        return new TotpResponse(acknowledgement, info.totp);
    }

    /**
     * Create SymmetricKeyResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} key
     * @return {SymmetricKeyResponse}
     * @private
     */
    static _createSymmetricKeyResponse (acknowledgement, info)
    {
        return new SymmetricKeyResponse(acknowledgement, info.key);
    }

    /**
     * Create RandomResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} pseudoRandomNumber
     * @return {RandomResponse}
     * @private
     */
    static _createRandomResponse (acknowledgement, info)
    {
        return new RandomResponse(acknowledgement, info.pseudoRandomNumber)
    }

    /**
     * Create SignatureResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {string} signature
     * @property {string} verificationKey
     * @return {SignatureResponse}
     * @private
     */
    static _createSignatureResponse (acknowledgement, info)
    {
        return new SignatureResponse(acknowledgement, info.signature, info.verificationKey)
    }

    /**
     * Create KeyDeleteResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} keyInfo
     * @return {KeyDeleteResponse}
     * @private
     */
    static _createKeyDeleteResponse (acknowledgement, keyInfo)
    {
        return new KeyDeleteResponse(acknowledgement, NeaResponseFactory._createKeyTypeInfo(keyInfo));
    }

    /**
     * Create GeneralErrorEvent
     * @param {BaseEvent} event
     * @param {object} eventInfo
     * @type {object}
     * @property {string} err
     * @return {GeneralErrorEvent}
     * @private
     */
    static _createGeneralErrorEvent (event, eventInfo)
    {
        return new GeneralErrorEvent(event, eventInfo.err);
    }

    /**
     * Create PresenceChangeEvent
     * @param {FoundChangeEvent} foundChange
     * @param {object} eventInfo
     * @type {object}
     * @property {boolean} authenticated
     * @property {number} age
     * @property {number} remaining
     * @return {PresenceChangeEvent}
     * @private
     */
    static _createPresenceChangeEvent (foundChange, eventInfo)
    {
        return new PresenceChangeEvent(foundChange, eventInfo.authenticated, eventInfo.age, eventInfo.remaining);
    }

    /**
     * Create FoundChangeEvent
     * @param {BaseEvent} event
     * @param {object} eventInfo
     * @type {object}
     * @property {string} after
     * @property {string} before
     * @property {string} pid
     * @property {int} tid
     * @return {FoundChangeEvent}
     * @private
     */
    static _createFoundChangeEvent (event, eventInfo)
    {
        return new FoundChangeEvent(event, eventInfo.after, eventInfo.before, eventInfo.pid, eventInfo.tid);
    }

    /**
     * Create BaseEvent
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} event
     * @type {object}
     * @property {string} kind
     * @return {BaseEvent}
     * @private
     */
    static _createBaseEvent (acknowledgement, event)
    {
        return new BaseEvent(acknowledgement, event.kind);
    }

    /**
     * Create NotificationResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @return {NotificationResponse}
     * @private
     */
    static _createNotificationResponse (acknowledgement, info)
    {
        return new NotificationResponse(acknowledgement, NeaResponseFactory._createNotificationInfo(info));
    }

    /**
     * Create NotificationInfo
     * @param {object} info
     * @type {object}
     * @property {boolean} onFirmwareVersion
     * @property {boolean} onFoundChange
     * @property {boolean} onGeneralError
     * @property {boolean} onPresenceChange
     * @property {boolean} onProvision
     * @return {NotificationInfo}
     * @private
     */
    static _createNotificationInfo (info)
    {
        return new NotificationInfo(
            info.onFirmwareVersion,
            info.onFoundChange,
            info.onGeneralError,
            info.onPresenceChange,
            info.onProvision || false
        );
    }

    /**
     * Create InfoResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @return {InitResponse}
     * @private
     */
    static _createInitResponse (acknowledgement, info)
    {
        return new InitResponse(acknowledgement, NeaResponseFactory._createNapiInitInfo(info));
    }

    /**
     * Create NapiInitInfo
     * @param {object} info
     * @type {object}
     * @property {string} NEAName
     * @property {boolean} inited
     * @property {object} network
     * @property {string} network.host
     * @property {int} network.port
     * @property {SignatureAlgorithm} signatureAlgorithm
     * @return {NapiInitInfo}
     * @private
     */
    static _createNapiInitInfo (info)
    {
        return new NapiInitInfo(
            info.NEAName,
            info.inited,
            info.network.host,
            info.network.port,
            info.signatureAlgorithm
        );
    }

    /**
     * Create InfoResponse
     * @param {AcknowledgementResponse} acknowledgement
     * @param {object} info
     * @type {object}
     * @property {object} config
     * @property {object} nymiband
     * @property {object} provisionMap
     * @property {string[]} provisions
     * @property {string[]} provisionsPresent
     * @property {int[]} tidIndex
     * @return {InfoResponse}
     * @private
     */
    static _createInfoResponse (acknowledgement, info)
    {
        let bands = info.nymiband.reduce((prev, b) => {
            let prov = b.isProvisioned ? NeaResponseFactory._createProvisionInfo(b) : undefined;
            return prev.concat(NeaResponseFactory._createNymiBandInfo(b, prov));
        }, []);

        return new InfoResponse(
            acknowledgement,
            NeaResponseFactory._createNapiConfigInfo(info.config),
            bands,
            info.provisionMap,
            info.provisions,
            info.provisionsPresent,
            info.tidIndex
        );
    }

    /**
     * Create AcknowledgementResponse
     * @param {NeaResponse} response
     * @return {AcknowledgementResponse}
     * @private
     */
    static _createAcknowledgementResponse (response)
    {
        return new AcknowledgementResponse(
            response.completed,
            response.errors,
            response.outcome,
            response.request,
            response.exchange,
            response.path,
            response.successful
        );
    }

    /**
     * Create NapiConfigInfo
     * @param {object} info
     * @type {object}
     * @property {string} commit
     * @property {boolean} detecting
     * @property {boolean} discovering
     * @property {string} ecodaemon
     * @property {boolean} finding
     * @property {boolean} net
     * @property {boolean} running
     * @property {string} version
     * @return {NapiConfigInfo}
     * @private
     */
    static _createNapiConfigInfo (info)
    {
        return new NapiConfigInfo(
            info.commit,
            info.detecting,
            info.discovering,
            info.ecodaemon,
            info.finding,
            info.net,
            info.running,
            info.version
        )
    }

    /**
     * Create NymiBandInfo
     * @param {object} info
     * @type {object}
     * @property {number} RSSI_last
     * @property {number} RSSI_smoothed
     * @property {string} firmwareVersion
     * @property {FoundState} found
     * @property {boolean} provisioned
     * @property {boolean} isProvisioned
     * @property {PresenceState} present
     * @property {number} sinceLastContact
     * @property {int} tid
     * @param {ProvisionInfo} provisionInfo
     * @return {NymiBandInfo}
     * @private
     */
    static _createNymiBandInfo (info, provisionInfo)
    {
        return new NymiBandInfo(
            info.RSSI_last,
            info.RSSI_smoothed,
            info.firmwareVersion,
            info.found,
            info.provisioned || info.isProvisioned,
            info.present,
            info.sinceLastContact,
            info.tid,
            provisionInfo
        );
    }

    /**
     * Create ProvisionInfo
     * @param {object} info
     * @type {object}
     * @property {string} pid
     * @property {number} authenticationWindowRemaining
     * @property {string[]} commandQueue
     * @property {int} commandsQueued
     * @property {boolean} hasApproached
     * @property {ProximityState} proximity
     * @property {object} provisioned
     * @property {string} provisioned.pid
     * @property {number} provisioned.authenticationWindowRemaining
     * @property {int} provisioned.commandsQueued
     * @return {ProvisionInfo}
     * @private
     */
    static _createProvisionInfo (info)
    {
        return new ProvisionInfo(
            info.pid || info.provisioned.pid,
            info.authenticationWindowRemaining || info.provisioned.authenticationWindowRemaining,
            info.commandQueue,
            info.commandsQueued || info.provisioned.commandsQueued,
            info.hasApproached || false,
            info.proximity || NymiApi.ProximityState.NOT_READY,
            NeaResponseFactory._createKeyTypeInfo(typeof info.provisioned === 'object' ? info.provisioned : info)
        );
    }

    /**
     * Create KeyTypeInfo
     * @type {object}
     * @property {boolean} enabledCDF
     * @property {boolean} enabledRoamingAuthSetup
     * @property {boolean} enabledSigning
     * @property {boolean} enabledSymmetricKeys
     * @property {boolean} enabledTOTP
     * @property {boolean} cdf
     * @property {boolean} ra
     * @property {boolean} sign
     * @property {boolean} symmetric
     * @property {boolean} totp
     * @param {object} info
     * @return {KeyTypeInfo}
     * @private
     */
    static _createKeyTypeInfo (info)
    {
        return new KeyTypeInfo(
            info.enabledCDF || info.cdf || false,
            info.enabledRoamingAuthSetup || info.ra,
            info.enabledSigning || info.sign,
            info.enabledSymmetricKeys || info.symmetric,
            info.enabledTOTP || info.totp
        );
    }
}

module.exports = NeaResponseFactory;