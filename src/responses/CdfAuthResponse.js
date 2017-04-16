'use strict';

const AcknowledgeResponse = require('./AcknowledgeResponse');

class CdfAuthResponse extends AcknowledgeResponse
{
    /**
     * Instantiate a CDF Authentication response
     * @param {AcknowledgeResponse} response
     * @param {string} deviceKeyHMAC
     * @param {string} sessionKeyHMAC
     */
    constructor (response, deviceKeyHMAC, sessionKeyHMAC)
    {
        super(
            response.isCompleted(),
            response.getErrors(),
            response.getRequest(),
            response.getExchange(),
            response.getPath(),
            response.isSuccessful()
        );

        this._deviceKeyHMAC = String(deviceKeyHMAC);
        this._sessionKeyHMAC = String(sessionKeyHMAC);
    }

    /**
     * DeviceKeyHMAC getter
     * @param {string} [encoding = 'hex']
     * @return {Buffer|string}
     */
    getDeviceKeyHmac (encoding = 'hex')
    {
        if (encoding === 'hex') {
            return this._deviceKeyHMAC;
        }
        //noinspection JSValidateTypes
        return Buffer.from(this._deviceKeyHMAC, 'hex');
    }

    /**
     * SessionKeyHMAC getter
     * @param {string} [encoding = 'hex']
     * @return {Buffer|string}
     */
    getSessionKeyHmac (encoding = 'hex')
    {
        if (encoding === 'hex') {
            return this._sessionKeyHMAC;
        }
        //noinspection JSValidateTypes
        return Buffer.from(this._sessionKeyHMAC, 'hex');
    }
}

module.exports = CdfAuthResponse;