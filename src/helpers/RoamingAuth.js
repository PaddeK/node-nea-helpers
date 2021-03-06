'use strict';

const
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
    openssl = require('openssl-wrapper').exec,
    asn1 = require('asn1.js'),
    ECC = require('elliptic').ec,
    rfc5280 = require('asn1.js-rfc5280'),
    Utils = require('./Utils');

class RoamingAuth
{
    /**
     * Generates a PEM file containing private key and certificate required for a Roaming Authentication Service
     * @param {string} file             Target file to save PEM
     * @param {int} days                Number of days the certificate is valid use (Infinity for maximum allowed days)
     * @param {string} [CN]             Common Name of certificate subject
     * @param {string} [C]              Country Name of certificate subject
     * @param {string} [ST]             State or Province Name of certificate subject
     * @param {string} [L]              Locality Name of certificate subject
     * @param {string} [O]              Organization Name of certificate subject
     * @param {string} [OU]             Organizational Unit Name of certificate subject
     * @param {string} [emailAddress]   Email Address of certificate subject
     * @static
     * @return {Promise}
     */
    static generatePem (file, days, CN, C, ST, L, O, OU, emailAddress)
    {
        let s,
            a = [...arguments].slice(2),
            keys = Object.keys,
            now = new Date(),
            maxDate = new Date('2038-01-18'),
            maxDays = ~~((maxDate.getTime() - now.getTime()) / 86400000);

        s = keys({CN, C, ST, L, O, OU, emailAddress}).reduceRight((p, c, i) => p + (a[i] ? `/${c}=${a[i]}` : ''), '');

        return new Promise((resolve, reject) => {
            if (s.length === 0) {
                return reject('genRoamingAuthServiceCert: One of CN, C, ST, L, O, OU or emailAddress must be given');
            }

            if (days === Infinity) {
                days = maxDays;
            }

            if (~~days === 0) {
                return reject('genRoamingAuthServiceCert: Days parameter must be given and greater zero');
            }

            if (~~days > maxDays) {
                return reject(`genRoamingAuthServiceCert: Maximum for days is ${maxDays}`);
            }

            try {
                let params = {name: 'prime256v1', genkey: true, 'param_enc': 'explicit', out: file},
                    pemPath = path.dirname(file);

                if (Utils.isValidPath(pemPath) && path.basename(file) && Utils.hasAccess(pemPath, 'frw')) {
                    openssl('ecparam', params, err => {
                        if (err) {
                            return reject(err);
                        }
                        params = {
                            extensions: 'v3_req',
                            sha256: true,
                            nodes: true,
                            new: true,
                            x509: true,
                            days: days,
                            key: file,
                            subj: s
                        };
                        openssl('req', params, (err, buff) => {
                            if (err) {
                                return reject(err);
                            }
                            fs.appendFile(file, buff.toString(), resolve);
                        });
                    });
                } else {
                    reject('genRoamingAuthServiceCert: Invalid file parameter given');
                }
            } catch (err) {
                if (Utils.hasAccess(file, 'frw')) {
                    Utils.tryCatch(() => fs.unlinkSync(file), reject);
                }
                reject(err);
            }
        });
    }

    /**
     * Get the public key from a certificate pem file
     * @param {string} file
     * @static
     * @return {String} public key raw X + Y values as hex string or empty string on error
     */
    static getPublicKey (file)
    {
        if (!Utils.hasAccess(file, 'fr')) {
            throw new Error('Certificate not found or insufficient permissions');
        }

        try {
            let pem = fs.readFileSync(file),
                /**
                 * @type {object}
                 * @property {object} tbsCertificate.subjectPublicKeyInfo.subjectPublicKey
                 * @property {Buffer} tbsCertificate.subjectPublicKeyInfo.subjectPublicKey.data
                 */
                cert = rfc5280.Certificate.decode(pem, 'pem', {label:'CERTIFICATE'});

            return cert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey.data.slice(1).toString('hex');
        } catch (err) {
            return ''
        }
    }

    /**
     * Sign a message with a private key from pem file
     * @param {string} file
     * @param {string} message
     * @static
     * @return {String} signature in raw R + S values as hex string or empty string on error
     */
    static sign (file, message)
    {
        if (!Utils.hasAccess(file, 'fr')) {
            throw new Error('Certificate not found or insufficient permissions');
        }

        try {
            //noinspection JSCheckFunctionSignatures
            let Asn1Signature = asn1.define('signature', function() {
                    let seq = this.seq(),
                        /**
                         * @type {object}
                         * @property {function} int
                         */
                        r = this.key('r'),
                        s = this.key('s');
                    seq.obj(r.int(), s.int());
                }),
                signature = crypto.createSign('sha256').update(Buffer.from(message, 'hex')).sign(fs.readFileSync(file)),
                /**
                 * @type {object}
                 * @property {function} r.toBuffer
                 * @property {function} s.toBuffer
                 */
                decoded = Asn1Signature.decode(signature, 'der');

            return Buffer.concat([decoded.r.toBuffer(), decoded.s.toBuffer()]).toString('hex');
        } catch (err) {
            return '';
        }
    }

    /**
     * Verify signature with a public key
     * @param {string} message
     * @param {string} signature
     * @param {string} publicKey
     * @static
     * @return {Boolean}
     */
    static verify (message, signature, publicKey)
    {
        try {
            let curve = new ECC('p256'),
                key = curve.keyFromPublic('04' + publicKey, 'hex'),
                sig = {r: signature.slice(0, 64), s: signature.slice(64)};

            //noinspection JSCheckFunctionSignatures
            return key.verify(crypto.createHash('sha256').update(Buffer.from(message, 'hex')).digest('hex'), sig)
        } catch (err) {
            return false;
        }
    }
}

module.exports = RoamingAuth;