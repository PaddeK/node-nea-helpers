'use strict';

const AcknowledgeResponse = require('./AcknowledgeResponse');

class CdfRegistrationResponse extends AcknowledgeResponse
{
    /**
     * Instantiate a CDF Registration response
     * @param {AcknowledgeResponse} response
     * @param {string} authenticationKey
     * @param {string} deviceKey
     */
    constructor (response, authenticationKey, deviceKey)
    {
        super(
            response.isCompleted(),
            response.getErrors(),
            response.getRequest(),
            response.getExchange(),
            response.getPath(),
            response.isSuccessful()
        );

        this._authenticationKey = String(authenticationKey);
        this._deviceKey = String(deviceKey);
    }

    /**
     * AuthenticationKey getter
     * @param {string} [encoding = 'hex']
     * @return {Buffer|string}
     */
    getAuthenticationKey (encoding = 'hex')
    {
        if (encoding === 'hex') {
            return this._authenticationKey;
        }
        //noinspection JSValidateTypes
        return Buffer.from(this._authenticationKey, 'hex');
    }

    /**
     * DeviceKey getter
     * @param {string} [encoding = 'hex']
     * @return {Buffer|string}
     */
    getDeviceKey (encoding = 'hex')
    {
        if (encoding === 'hex') {
            return this._deviceKey;
        }
        //noinspection JSValidateTypes
        return Buffer.from(this._deviceKey, 'hex');
    }
}

module.exports = CdfRegistrationResponse;