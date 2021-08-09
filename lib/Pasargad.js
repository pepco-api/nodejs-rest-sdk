const crypto = require('crypto');
const RsaXml = require('rsa-xml');
const fs = require('fs');

// todo
const request = require('request-promise');
const { URLSearchParams } = require('url');
const uuid = require('uuid/v4');
const packageJson = require('../package');
/**
 * Redirect User with token to this URL
 * e.q: https://pep.shaparak.ir/payment.aspx?n=Token
 */
 const URL_PAYMENT_GATEWAY = "https://pep.shaparak.ir/payment.aspx";

/*** Address of gateway for getting token */
const URL_GET_TOKEN = "https://pep.shaparak.ir/Api/v1/Payment/GetToken";

const URL_CHECK_TRANSACTION = 'https://pep.shaparak.ir/Api/v1/Payment/CheckTransactionResult';
const URL_VERIFY_PAYMENT = 'https://pep.shaparak.ir/Api/v1/Payment/VerifyPayment';
const URL_REFUND = 'https://pep.shaparak.ir/Api/v1/Payment/VerifyPayment';

const VALUE_SEPARATOR = '|';
const DEFAULT_ALGORITHM = 'sha256';
const DEFAULT_ENCODING = 'hex';
const CLIENT_NAME = 'node_sdk';

/**
 * Class for Pasargad RESTful API (v1)
 *
 * @class
 */
module.exports = class Pasargad 
{ 

    /**
     * Constructs the Pasargad object.
     *
     * @param {string} merchantCode  Merchant Code of the merchant
     * @param {string} terminalId  TerminalId of the merchant
     * @param {string} redirectUrl  Redirect URL
     * @param {string} certificateFile  Certificate file location
     */
    constructor (merchantCode,terminalId,redirectUrl,certificateFile) {
        this._merchantcode = merchantCode;
        this._terminalId = terminalId;
        this._redirectUrl = redirectUrl;
        this._certificateFile = certificateFile;
    }

    /**
     * merchantCode setter
     *
     * @param {string} merchantCode   Merchant Code of the merchant
     */
    set merchantCode (merchantCode) {
        this._merchantcode = merchantCode;
    }
    
    /**
     * terminalId setter
     *
     * @param {string} terminalId  TerminalId of the merchant
     */
     set terminalId (terminalId) {
        this._terminalId = terminalId;
    }
    
    /**
     * redirectUrl setter
     *
     * @param {string} redirectUrl   Redirect URL
     */
     set redirectUrl (redirectUrl) {
        this._redirectUrl = redirectUrl;
    }

    /**
     * certificateFile setter
     *
     * @param {string} certificateFile   Certificate file location
     */
     set certificateFile (certificateFile) {
        this._certificateFile = certificateFile;
    }
    
    /**
     * sign setter
     *
     * @param {string} sign   Sign of the params
     */
     set sign (sign) {
        this._sign = sign;
    }

    /**
     * Build HTTP request
     *
     * @param      {Object}  args         The arguments
     * @param      {string}  args.url     The url
     * @param      {string}  args.method  The method
     * @param      {Object}  args.body    The body
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    async _requestBuilder ({ url, method, body = null }) {
        const sign = this._sign;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Sign: `${sign}`
        };
        const options = {
            uri: url,
            method,
            headers,
            body: body,
            json: true
        };
        try {
            return await request(options);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Normalize amount
     *
     * @param   {(string|number)}amount     The amount
     * @return  {string}  Return Promise with result
     */
    _normalizeAmount (amount = 0) {
        return parseInt(amount).toFixed(2);
    }

    /**
     * Sign Data
     * 
     * @param {*} data 
     * @returns 
     */
    signData(data) {
        const xmlKey = fs.readFileSync(this._certificateFile);
        const pemKey = new RsaXml().exportPemKey(xmlKey);
        
        let sign = crypto.createSign('SHA1');
        sign.write(JSON.stringify(data));
        sign.end();
        this.sign = sign.sign(Buffer.from(pemKey), 'base64'); 
        return this.sign;
    }

    redirect() {
        // TODO!
        response.writeHead(302, {
             'Location': 'http://uri'
        });
        response.end();
    }
};
