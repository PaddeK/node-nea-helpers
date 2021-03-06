'use strict';

const
    fs = require('fs'),
    NymiApi = require('./NymiApi'),
    path = require('path'),
    Utils = require('./Utils'),
    NEANameRgx = /^[a-zA-Z0-9-_ ]{6,}$/i;

class NeaConfig
{
    /**
     * Creates a NeaConfig instance.
     * @param {string} config
     */
    constructor (config)
    {
        let cnf = {};

        if (!Utils.isValidPath(path.dirname(config))) {
            throw new TypeError('Directory of given config is not valid');
        }

        if (Utils.hasAccess(config, 'f')) {
            if (!Utils.hasAccess(config, 'rw') || !fs.statSync(config).isFile() || !path.isAbsolute(config)) {
                throw new TypeError('Given config must be readable and writeable');
            }

            cnf = Utils.tryCatch(() => JSON.parse(fs.readFileSync(config, 'utf8')), false);

            if (cnf === false || !this.isValidConfig(cnf)) {
                throw new SyntaxError('Error while parsing or invalid config');
            }
        } else {
            if (!Utils.hasAccess(path.dirname(config), 'rw')) {
                throw new TypeError('Given config path must be readable and writeable');
            }
        }

        /**
         * @typedef {object} config
         * @property {string} neaName
         * @property {string} logDirectory
         * @property {int} logLevel
         * @property {int} port
         * @property {string} host
         * @property {boolean} nymulator
         * @property {int} retryCount
         * @property {int} interval
         * @property {string} sigAlgorithm
         */

        this._config = cnf;
        this._configFile = config;
        this._neaName = cnf.neaName;
        this._logDirectory = cnf.logDirectory || path.dirname(config);
        this._logLevel = cnf.logLevel || NymiApi.LogLevel.NONE;
        this._port = cnf.port || 9089;
        this._host = cnf.host || '127.0.0.1';
        this._nymulator = cnf.nymulator || false;
        this._retryCount = cnf.retryCount || 3;
        this._interval = cnf.interval || 100;
        this._sigAlgorithm = cnf.sigAlgorithm || NymiApi.SignatureAlgorithm.NIST256P;
    }

    /**
     * Signature Algorithm getter
     * @return {string}
     */
    getSigAlgorithm ()
    {
        return this._sigAlgorithm;
    }

    /**
     * Signature Algorithm setter
     * @param {string} sigAlgorithm
     * @return {NeaConfig}
     */
    setSigAlgorithm (sigAlgorithm)
    {
        this._sigAlgorithm = String(sigAlgorithm);
        return this;
    }

    /**
     * Nymulator getter
     * @return {boolean}
     */
    isNymulator ()
    {
        return this._nymulator;
    }

    /**
     * Nymulator setter
     * @param {boolean} nymulate
     * @returns {NeaConfig}
     */
    useNymulator (nymulate)
    {
        this._nymulator = !!nymulate;
        return this;
    }

    /**
     * Host getter
     * @return {string}
     */
    getHost ()
    {
        return this._host;
    }

    /**
     * Host setter
     * @param {string} host
     * @return {NeaConfig}
     */
    setHost (host)
    {
        this._host = String(host);
        return this;
    }

    /**
     * Port getter
     * @return {int}
     */
    getPort ()
    {
        return this._port;
    }

    /**
     * Port setter
     * @param {int} port
     * @return {NeaConfig}
     */
    setPort (port)
    {
        this._port = ~~port;
        return this;
    }

    /**
     * RetryCount getter
     * @return {int}
     */
    getRetryCount ()
    {
        return this._retryCount;
    }

    /**
     * RetryCount setter
     * @param {int} count
     * @return {NeaConfig}
     */
    setRetryCount (count)
    {
        this._retryCount = ~~count;
        return this;
    }

    /**
     * Interval getter
     * @return {int}
     */
    getInterval ()
    {
        return this._interval;
    }

    /**
     * Interval setter
     * @param {int} ms
     * @return {NeaConfig}
     */
    setInterval (ms)
    {
        this._interval = ~~ms;
        return this;
    }

    /**
     * LogLevel getter
     * @return {int}
     */
    getLogLevel ()
    {
        return this._logLevel;
    }

    /**
     * LogLevel setter
     * @param {int} logLevel
     * @return {NeaConfig}
     */
    setLogLevel (logLevel)
    {
        this._logLevel = logLevel;
        return this;
    }

    /**
     * Name getter
     * @return {string}
     */
    getName ()
    {
        return this._neaName;
    }

    /**
     * NeaName setter
     * @param {string} name
     * @returns {NeaConfig}
     */
    setName (name)
    {
        this._neaName = String(name);
        return this;
    }

    /**
     * LogDirectory getter
     * @return {string}
     */
    getLogDirectory ()
    {
        return this._logDirectory;
    }

    /**
     * LogDirectory  setter
     * @param {string} directory
     * @returns {NeaConfig}
     */
    setLogDirectory  (directory)
    {
        this._logDirectory = String(directory);
        return this;
    }

    /**
     * Converts this object to string representation.
     * @override
     * @return {string}
     */
    toString ()
    {
        return JSON.stringify(this.toJson(), null, 4);
    }

    /**
     * Returns a JSON representation of this object
     * @returns {object}
     */
    toJson ()
    {
        return {
            neaName: this.getName(),
            logDirectory: this.getLogDirectory(),
            logLevel: this.getLogLevel(),
            port: this.getPort(),
            host: this.getHost(),
            nymulator: this.isNymulator(),
            retryCount: this.getRetryCount(),
            interval: this.getInterval(),
            sigAlgorithm: this.getSigAlgorithm()
        };
    }

    /**
     * Save this config
     * @return {void}
     */
    save ()
    {
        fs.writeFileSync(this._configFile, this.toString());
    }

    /**
     * @typedef {Object} Config
     * @property {string} neaName
     * @property {string} sigAlgorithm
     * @property {int} port
     * @property {string} host
     * @property {int} logLevel
     * @property {boolean} nymulator
     */
    /**
     * Validate Config.json file of NEA
     *
     * @param {Config} config   Config.json of NEA.
     * @return {boolean}
     */
    isValidConfig (config)
    {
        return [
            typeof config === 'object',
            ['logLevel', 'port', 'host', 'nymulator', 'neaName'].every(key => config[key] !== undefined),
            typeof config.neaName === 'string',
            NEANameRgx.test(config.neaName),
            config.neaName.length <= 18,
            config.nymulator === false || config.nymulator === true,
            typeof config.host === 'string',
            config.host.length > 0,
            ['logLevel', 'port'].every(key => config[key] === ~~config[key]),
            Object.values(NymiApi.LogLevel).includes(config.logLevel),
            config.port >= 1024 && config.port <= 65535,
            Object.keys(NymiApi.SignatureAlgorithm).includes(config.sigAlgorithm)
        ].every(Boolean);
    }
}

module.exports = NeaConfig;