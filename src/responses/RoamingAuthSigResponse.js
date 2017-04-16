'use strict';

const AcknowledgeResponse = require('./AcknowledgeResponse');

class RoamingAuthSigResponse extends AcknowledgeResponse
{
    /**
     * Instantiate a Signature response
     * @param {AcknowledgeResponse} response
     * @param {string} nymibandSig
     * @param {string} raKeyId
     */
    constructor (response, nymibandSig, raKeyId)
    {
        super(
            response.isCompleted(),
            response.getErrors(),
            response.getRequest(),
            response.getExchange(),
            response.getPath(),
            response.isSuccessful()
        );

        this._nymibandSig = String(nymibandSig);
        this._raKeyId = String(raKeyId);
    }

    /**
     * Roaming Authentication Key getter
     * @param {string} [encoding = 'hex']
     * @return {Buffer|string}
     */
    getNymiBandSignature (encoding = 'hex')
    {
        if (encoding === 'hex') {
            return this._nymibandSig;
        }
        //noinspection JSValidateTypes
        return Buffer.from(this._nymibandSig, 'hex');
    }

    /**
     * Roaming Authentication KeyID getter
     * @param {string} [encoding = 'hex']
     * @return {Buffer|string}
     */
    getRoamingAuthKeyId (encoding = 'hex')
    {
        if (encoding === 'hex') {
            return this._raKeyId;
        }
        //noinspection JSValidateTypes
        return Buffer.from(this._raKeyId, 'hex');
    }
}

module.exports = RoamingAuthSigResponse;