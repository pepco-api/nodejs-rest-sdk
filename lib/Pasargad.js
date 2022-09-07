const crypto = require('crypto');
const RsaXml = require('rsa-xml');
const fs = require('fs');
const fetch = require("node-fetch");
// =====
const ACTION_PAYMENT = 1003;
/**
 * Redirect User with token to this URL
 * e.q: https://pep.shaparak.ir/payment.aspx?n=Token
 */
 const URL_PAYMENT_GATEWAY = "https://pep.shaparak.ir/payment.aspx";

/*** Address of gateway for getting token */
const URL_GET_TOKEN = "https://pep.shaparak.ir/Api/v1/Payment/GetToken";

const URL_CHECK_TRANSACTION = 'https://pep.shaparak.ir/Api/v1/Payment/CheckTransactionResult';
const URL_VERIFY_PAYMENT = 'https://pep.shaparak.ir/Api/v1/Payment/VerifyPayment';
const URL_REFUND = 'https://pep.shaparak.ir/Api/v1/Payment/RefundPayment';



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
     * amount setter
     *
     * @param {int} amount  Payment Amount
     */
     set amount (amount) {
        this._amount = amount;
    }
    
    
    
    /**
     * payment reference id  setter
     *
     * @param {string} transactionReferenceID  Payment reference id 
     */
     set transactionReferenceID (transactionReferenceID) {
        this._transactionReferenceID = transactionReferenceID;
    }
    
    
    /**
     * invoiceDate setter
     *
     * @param {string} invoiceDate  Payment Date in "2021/08/11 13:25:00"
     */
     set invoiceDate (invoiceDate) {
        this._invoiceDate = invoiceDate;
    }

    
    /**
     * invoiceN umber setter
     *
     * @param {string} invoiceNumber  Unique number of Invoice to get paid 
     */
     set invoiceNumber (invoiceNumber) {
        this._invoiceNumber = invoiceNumber;
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
     * token setter
     *
     * @param {string} token   token of signed params
     */
     set token (token) {
        this._token = token;
    }

    
    /**
     * response setter
     *
     * @param {string} response  Response of the request
     */
     set response (response) {
        this._response = response;
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
        try {
            const response = await fetch(url, {
                method: method,
                body:    body,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Sign': `${sign}`
                }
            });
            return response.json();
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
        const xmlKey = fs.readFileSync(this._certificateFile).toString('base64'); 
        let sign = crypto.createSign('SHA1');
        sign.pemkey =  new RsaXml().exportPemKey(xmlKey); 
        sign.write(JSON.stringify(data));
        sign.end();  
        this._sign = sign.sign(Buffer.from(sign.pemkey), 'base64');
        return this._sign;
    }

    getTimestamp() {
        const currentDateISO = new Date().toISOString();
        return currentDateISO.replace(/-/g, '/').replace('T', ' ').replace('Z', '').split('.')[0];
    }

    async getToken(params)
    {
        let redirectToken; 
        this.signData(params); 
        await this._requestBuilder({
            url: URL_GET_TOKEN,
            method: "POST",
            body: (JSON.stringify(params))
        }).then(data => { 
            this._token = data.Token;
            redirectToken = URL_PAYMENT_GATEWAY + "?n=" + this._token; // JSON data parsed by `data.json()` call
          });
        return redirectToken;
    }

    async redirect() {
        const params = {
            amount: this._amount,
            invoiceNumber: this._invoiceNumber,
            invoiceDate: this._invoiceDate,
            action: ACTION_PAYMENT,
            merchantCode: `${this._merchantcode}`,
            terminalCode: `${this._terminalId}`,
            redirectAddress: this._redirectUrl,
            timeStamp: this.getTimestamp()
        };
        return this.getToken(params);
    }

    
    async checkTransaction() {
        const params = {
            transactionReferenceID: this._transactionReferenceID,
            invoiceNumber: this._invoiceNumber,
            invoiceDate: this._invoiceDate,
            merchantCode: `${this._merchantcode}`,
            terminalCode: `${this._terminalId}`
        };
        this.signData(params); 
        let response;
        await this._requestBuilder({
            url: URL_CHECK_TRANSACTION,
            method: "POST",
            body: (JSON.stringify(params))
        }).then(data => { 
            response = data;
          });
        return response;
    }
    
    async verifyPayment() 
    {
        const params = {
            amount: this._amount,
            invoiceNumber: this._invoiceNumber,
            invoiceDate: this._invoiceDate,
            merchantCode: `${this._merchantcode}`,
            terminalCode: `${this._terminalId}`,
            timeStamp: this.getTimestamp()
        };
        this.signData(params); 
        let response;
        await this._requestBuilder({
            url: URL_VERIFY_PAYMENT,
            method: "POST",
            body: (JSON.stringify(params))
        }).then(data => { 
            response = data;
        });
        return response;
    }
    
    async refundPayment() 
    {
        const params = {
            invoiceNumber: this._invoiceNumber,
            invoiceDate: this._invoiceDate,
            merchantCode: `${this._merchantcode}`,
            terminalCode: `${this._terminalId}`,
            timeStamp: this.getTimestamp()
        };
        this.signData(params); 
        let response;
        await this._requestBuilder({
            url: URL_REFUND,
            method: "POST",
            body: (JSON.stringify(params))
        }).then(data => { 
            response = data;
        });
        return response;
    }
};