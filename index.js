'use strict';

const
    Nea = require('./src/helpers/Nea'),
    Utils = require('./src/helpers/Utils'),
    NymiApi = require('./src/helpers/NymiApi'),
    BaseEvent = require('./src/events/BaseEvent'),
    NeaConfig = require('./src/helpers/NeaConfig'),
    NeaRequest = require('./src/helpers/NeaRequest'),
    KeyTypeInfo = require('./src/models/KeyTypeInfo'),
    RoamingAuth = require('./src/helpers/RoamingAuth'),
    NeaResponse = require('./src/helpers/NeaResponse'),
    PatternEvent = require('./src/events/PatternEvent'),
    NapiInitInfo = require('./src/models/NapiInitInfo'),
    NymiBandInfo = require('./src/models/NymiBandInfo'),
    ProvisionInfo = require('./src/models/ProvisionInfo'),
    TotpResponse = require('./src/responses/TotpResponse'),
    InfoResponse = require('./src/responses/InfoResponse'),
    InitResponse = require('./src/responses/InitResponse'),
    BaseResponse = require('./src/responses/BaseResponse'),
    NapiConfigInfo = require('./src/models/NapiConfigInfo'),
    RandomResponse = require('./src/responses/RandomResponse'),
    FoundChangeEvent = require('./src/events/FoundChangeEvent'),
    ProvisionedEvent = require('./src/events/ProvisionedEvent'),
    NotificationInfo = require('./src/models/NotificationInfo'),
    CdfAuthResponse = require('./src/responses/CdfAuthResponse'),
    GeneralErrorEvent = require('./src/events/GeneralErrorEvent'),
    NeaRequestFactory = require('./src/helpers/NeaRequestFactory'),
    SignatureResponse = require('./src/responses/SignatureResponse'),
    KeyDeleteResponse = require('./src/responses/KeyDeleteResponse'),
    NeaResponseFactory = require('./src/helpers/NeaResponseFactory'),
    PresenceChangeEvent = require('./src/events/PresenceChangeEvent'),
    AcknowledgeResponse = require('./src/responses/AcknowledgeResponse'),
    RoamingAuthNonceEvent = require('./src/events/RoamingAuthNonceEvent'),
    NotificationResponse = require('./src/responses/NotificationResponse'),
    SymmetricKeyResponse = require('./src/responses/SymmetricKeyResponse'),
    ProvisionsChangedEvent = require('./src/events/ProvisionsChangedEvent'),
    RoamingAuthSigResponse = require('./src/responses/RoamingAuthSigResponse'),
    CdfRegistrationResponse = require('./src/responses/CdfRegistrationResponse'),
    RoamingAuthSetupResponse = require('./src/responses/RoamingAuthSetupResponse');

'use strict';

const NeaHelpers = {
    Events: {
        BaseEvent: BaseEvent,
        Pattern: PatternEvent,
        Provisioned: ProvisionedEvent,
        FoundChange: FoundChangeEvent,
        GeneralError: GeneralErrorEvent,
        PresenceChange: PresenceChangeEvent,
        RoamingAuthNonce: RoamingAuthNonceEvent,
        ProvisionsChanged: ProvisionsChangedEvent
    },
    Responses: {
        Totp: TotpResponse,
        Info: InfoResponse,
        Init: InitResponse,
        Random: RandomResponse,
        CdfAuth: CdfAuthResponse,
        BaseResponse: BaseResponse,
        KeyDelete: KeyDeleteResponse,
        Signature: SignatureResponse,
        Acknowledge: AcknowledgeResponse,
        Notification: NotificationResponse,
        SymmetricKey: SymmetricKeyResponse,
        RoamingAuthSig: RoamingAuthSigResponse,
        CdfRegistration: CdfRegistrationResponse,
        RoamingAuthSetup: RoamingAuthSetupResponse
    },
    Models: {
        KeyType: KeyTypeInfo,
        NapiInit: NapiInitInfo,
        NymiBand: NymiBandInfo,
        Provision: ProvisionInfo,
        NapiConfig: NapiConfigInfo,
        Notification: NotificationInfo
    },
    Const: {
        KeyType: NymiApi.KeyType,
        LogLevel: NymiApi.LogLevel,
        FoundState: NymiApi.FoundState,
        PresenceState: NymiApi.PresenceState,
        PatternAction: NymiApi.PatternAction,
        ProximityState: NymiApi.ProximityState,
        HapticNotification: NymiApi.HapticNotification,
        SignatureAlgorithm: NymiApi.SignatureAlgorithm
    },
    Nea: Nea,
    Utils: Utils,
    Request: NeaRequest,
    NeaConfig: NeaConfig,
    Response: NeaResponse,
    RoamingAuth: RoamingAuth,
    RequestFactory: NeaRequestFactory,
    ResponseFactory: NeaResponseFactory
};

module.exports = NeaHelpers;