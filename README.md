# NodeJS SDK for Pasargad

## Redirect To payment
```js
const PasargadApi = require('@pepco/nodejs-rest-sdk');

const pasargad = new PasargadApi(xxxxxx,xxxxx,"https://pep.co.ir/ipgtest","cert.xml");
try {
    pasargad.amount = 10000;
    pasargad.invoiceNumber = "5002";
    pasargad.invoiceDate = "2021/08/12 17:31:00";
    pasargad.redirect().then(redirectUrl => {
        // redirect Here 
        console.log(redirectUrl);
    });
} catch(e) {
    throw e;
}
```