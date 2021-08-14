# NodeJS SDK for Pasargad IPG
NodeJS package to connect your application to Pasargad Internet Payment Gateway through RESTful API

# Installation
For installation, use `npm` package:

```bash
$ npm install @pepco/nodejs-rest-sdk
```

# Usage
 - To Read API Documentation, [Click Here! (دانلود مستندات کامل درگاه پرداخت)](https://www.pep.co.ir/wp-content/uploads/2019/06/1-__PEP_IPG_REST-13971020.Ver3_.00.pdf)
 - Save your private key into an `.xml` file inside your project directory.

## Redirect User to Payment Gateway
```js
// Tip! Initialize this property in your payment service constructor method!
const PasargadApi = require('@pepco/nodejs-rest-sdk');
const pasargad = new PasargadApi(
    "YOUR_MERCHANT_CODE",
    "YOUR_TERMINAL_ID",
    "http://yoursite.com/redirect-url-here/",
    "certificate_file_location.xml"); 
    //e.q: 
    // const pasargad = new PasargadApi(xxxxxx,xxxxx,"https://pep.co.ir/ipgtest","cert.xml");

// Set Amount
pasargad.amount = 15000;

// Set Invoice Number (it MUST BE UNIQUE) 
pasargad.invoiceNumber = "4029";

// set Invoice Date with below format (Y/m/d H:i:s)
pasargad.invoiceDate = "2021/08/08 11:54:03";

// get the Generated RedirectUrl from Pasargad API (async request):
// output example: https://pep.shaparak.ir/payment.aspx?n=bPo+Z8GLB4oh5W0KVNohihxCu1qBB3kziabGvO1xqg8Y=  
pasargad.redirect().then(redirectURL => {
    // redirect user to `redirectURL`
    console.log(redirectURL);
});
```

## Checking and Verifying Transaction
After Payment Process, User is going to be returned to your redirect_url.

payment gateway is going to answer the payment result with sending below parameters to your redirectURL (as `QueryString` parameters):
 - InvoiceNumber (IN field) 
 - InvoiceDate (ID field) 
 - TransactionReferenceID (tref field) 

Store this information in a proper data storage and let's check transaction result by sending a check api request to the Bank:

```js
// Set Transaction refrence id received in 
pasargad.transactionReferenceID = "636843820118990203";

// Set Unique Invoice Number that you want to check the result
pasargad.invoiceNumber = 4029;

// set Invoice Date of your Invoice
pasargad.invoiceDate = "2021/08/08 11:54:03";

// check Transaction result
pasargad.checkTransaction().then(response => {
    // you can handle the response here:
    console.log(response);
});
```

Successful result:
```json
{
    "TraceNumber": 13,
    "ReferenceNumber": 100200300400500,
    "TransactionDate": "2021/08/08 11:58:23",
    "Action": "1003",
    "TransactionReferenceID": "636843820118990203",
    "InvoiceNumber": "4029",
    "InvoiceDate": "2021/08/08 11:54:03",
    "MerchantCode": 100123,
    "TerminalCode": 200123,
    "Amount": 15000,
    "IsSuccess": true,
    "Message": " "
}
```
If you got `IsSuccess` with `true` value, so everything is O.K!

Now, for your successful transaction, you should call `verifyPayment()` method to keep the money and Bank makes sure the checking process was done properly:


```js
// Set Amount
pasargad.amount = 15000;

// Set Invoice Number (it MUST BE UNIQUE) 
pasargad.invoiceNumber = "4029";

// set Invoice Date with below format (Y/m/d H:i:s)
pasargad.invoiceDate = "2021/08/08 11:54:03";

// verify payment:
pasargad.verifyPayment().then(response => {
    // response
    console.log(response);
});
```

...and the successful response looks like this response:
```json
{
 "IsSuccess": true,
 "Message": " ",
 "MaskedCardNumber": "5022-29**-****-2328",
 "HashedCardNumber": "2DDB1E270C598677AE328AA37C2970E3075E1DB6665C5AAFD131C59F7FAD99F23680536B07C140D24AAD8355EA9725A5493AC48E0F48E39D50B54DB906958182",
 "ShaparakRefNumber": "100200300400500"
}

```

## Payment Refund
If for any reason, you decided to cancel an order in early hours after taking the order (maximum 2 hours later), you can refund the client payment to his/her bank card.

for this, use `refundPayment()` method:

```js
// Set Unique Invoice Number that you want to check the result
pasargad.invoiceNumber = "4029";

// set Invoice Date of your Invoice
pasargad.invoiceDate = "2021/08/08 11:54:03";

// check Transaction result    
pasargad.refundPayment().then(response => {
        // handle response here:
        console.log(response);
    });
```

# Support
Please use your credentials to login into [Support Panel](https://my.pep.co.ir)

Contact Author/Maintainer: [Reza Seyf](https://twitter.com/seyfcode) 