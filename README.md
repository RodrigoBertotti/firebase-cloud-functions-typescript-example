# api-example-firebase-admin-nodejs

A Node.js REST API example that uses Firebase Admin, built with Express and Typescript that can be used as template for the creation of new servers.

The main aspects of this sample are:

- A project structure that fits well for new API projects that uses **Firebase Authentication** and **Firestore**
- Access Control: Restricting routes access with custom claims and checking nuances
- Reject a request outside the controller easily by throwing `new HttpResponseError(status, codeString, message)`
- Logs: **winston** module is preconfigured to write `.log` files

## Summary

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Access Control](#access-control-custom-claims)
4. [Errors and permissions](#errors-and-permissions)
5. [Logs](#logs)
6. [Reference](#reference)

## Getting Started

# Configure the Firebase Console

In the Firebase Console
 
Go to Build > Authentication > Get Started > Sign-in method > Email/Password and enable Email/Password and save it.

Also go to Build > Firestore Database > Create database. You can choose the option `Start in test mode`.


### Step 2 - Generate your `firebase-credentials.json` file

1) Go to your Firebase Project 
2) Click on the engine icon (on right of "Project Overview")
3) "Project Settings"
4) "Service Accounts"
5) "Firebase Admin SDK" and make sure the "Node.js" option is selected
6) Click on "Generate new private key". Rename the downloaded file to `firebase-credentials.json` and move it to inside the
`environment` folder. 

⚠️ Keep `firebase-credentials.json` and `environment.ts` local,
don't commit these files, keep both on `.gitignore`

As any Firebase server, the API has administrative privileges,
that means the API has full permission to perform changes on the Firestore Database (and
other Firebase Resources) regardless of how the Firestore Security Rules are configured.

### Step 3 - To test your server locally:

This command will start and restart your server as code changes are made,
do not use on production

    npm run dev

Let's run `npm install` to install the dependencies and `npm run dev` 
to start your server locally on port 3000.

#### Other commands for the production environment

#### To build your server:

    npm run build

#### To start your server

    npm run start

### Step 4 - Use Postman to test it

1. In the Firebase Console > Go to Project Overview and Click on the **Web** platform to Add a new Platform

2. Add a Nickname like "Postman" and click on Register App

3. Copy the **apiKey** field

4. Download the [postman_collection.json file](postman_collection.json) and import it to your Postman

5. Test creating an account first, after that, go to the Login request 
example and pass the `apiKey` as query parameter

6. Copy the `idToken` and pass it, and pass it as header of the other requests, the header name is also `idToken`.

### 🚫 Permission errors

- #### "Only storeOwner can access"
Means you are not logged with a `buyer` claim rather
than with a user that contains the  `storeOwner` claim.

- #### "You aren't the correct storeOwner"
Means you are logged with the correct claim, but you are trying to read others storeOwner's data.

- #### "Requires authentication"

## Authentication

Firebase Authentication is used to verify
if the client is authenticated on Firebase Authentication,
to do so, the client side should inform the `isToken` header:

### `idToken` Header

The client's token on Firebase Authentication, 
it can be obtained on the client side after the authentication is performed with the
Firebase Authentication library for the client side,

The `idToken` can be generated by the client side only.

#### Option 1: Generating `idToken` with Postman:

Follow the previous instructions on [Step 4 - Use Postman to test it](#step-4---use-postman-to-test-it)

#### Option 2: Generating `idToken` with a Flutter Client:
```dart
final idToken = await FirebaseAuth.instance.currentUser!.getIdToken();
// use idToken as header
```

#### Option 3: Generating `idToken` with a Web Client:
```javascript
const idToken = await getAuth(firebaseApp).currentUser?.getIdToken();
// use idToken as header
```

## Access Control (custom claims)

This project uses custom claims on Firebase Authentication to
define which routes the users have access to.

### Define custom claims to a user

This can be done in the server like below:
```javascript
await admin.auth().setCustomUserClaims(user.uid, {
    storeOwner: true,
    buyer: false
});
```
### Configuring the routes

You can set a param (array of strings) on the `httpServer.<method>`
function, like:

```javascript
httpServer.get (
    '/product/:productId/full-details', 
    this.getProductByIdFull.bind(this), ['storeOwner']
);
```

In the example above, only users with the `storeOwner` custom claim will
have access to the `/product/:productId/full-details` path.

Is this enough? Not always, so let's check the next section [Errors and permissions](#errors-and-permissions).

## Errors and permissions

You can easily send an HTTP response with code between 400 and 500 to the client
by simply throwing a `new HttpResponseError(...)` on your controller, service or repository,
for example:

```javascript
throw new HttpResponseError(400, 'BAD_REQUEST', "Missing 'name' field on the body");
```

Sometimes defining roles isn't enough to ensure that a user can't 
access or modify a specific data,
let's imagine if a store owner tries to get full details
of a product he is not selling, like a product of another store owner,
he still has access to the route because of his `storeOwner` custom claim,
but an additional verification is needed.

```javascript
if (product.storeOwnerUid != req.auth!.uid) {
    throw new HttpResponseError(
        403, 
        'FORBIDDEN', 
        `Even though you are a store owner,
        you are a owner of another store,
        so you can't see full details of this product`
    );
}
```

## Authentication fields

This project adds 3 new fields to the request object on the 
express request handler:

### `req.authenticated` 
type: `boolean`

Is true only if the client is authenticated, which means, the client
informed `idToken` on the headers, and these
values were successfully validated.

### `req.auth` 
type: [UserRecord](https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.userrecord) | `null`

If authenticated: Contains user data of Firebase Authentication.

### `req.token` 
type: [DecodedIdToken](https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.decodedidtoken) | `null`

If authenticated: Contains token data of Firebase Authentication.

## Logs

You can save logs into a file by importing these functions of the `src/utils/logger.ts` file
and using like:
```javascript
log("this is a info", "info");
logDebug("this is a debug");
logInfo("this is a info");
logWarn("this is a warn");
logError("this is a error");
```
By default, a `logs` folder will be generated
aside this project folder, in this structure:

    - /api-example-firebase-nodejs
    --- /node_modules/*
    --- /src/*
    --- (and more)

    - /logs
    --- /api-example-firebase-nodejs
    ------ 2022-8-21.log
    ------ 2022-8-22.log
    ------ 2022-8-23.log
    ------ (and more)

Each `.log` file contains the logs of the respective day.

You can also go to `src/utils/logger.ts` and check `logsFilename` and `logsPathAndFilename` fields
to change the default path and filename so the logs can be saved with a different filename and
in a different location.

By default, regardless of the log level, all logs will be saved in the same file,
you can also change this behavior on the `winston.createLogger(transports: ...)` line of 
the `src/utils/logger.ts` file. 

## Getting in touch

Feel free to open a GitHub issue about:

- :grey_question: questions

- :bulb: suggestions

- :ant: potential bugs

## License

[MIT](LICENSE)

## Reference

This project used as reference part of the structure of the GitHub project [node-typescript-restify](https://github.com/vinicostaa/node-typescript-restify).
Thank you [developer](https://github.com/vinicostaa/)!

## Contacting me

📧 rodrigo@wisetap.com
