# TrustShift

## Introduction

TrustShift is an experimental browser extension aimed at enhancing security and privacy for users in environments that require disabling or restricting JavaScript execution on websites. The core idea of TrustShift is the relocation of JavaScript-based operations—especially those pertaining to authentication and encryption—into the extension itself. This approach allows users to interact with websites that incorporate "hook" HTML elements without enabling JavaScript. These hooks act as directives for TrustShift, signaling which functionalities to execute.

## DISCLAIMER

TrustShift is currently a personal and educational project. It has not undergone a formal security audit, and given its reliance on the WebCrypto API, there is great potential for accidental misuse of cryptographic primitives. TrustShift is not advised for personal use at this time. User discretion is advised.

## Key Features

### Existing

-   **Cryptographic Key Generation**: Generates symmetric cryptographic keypairs within the extension upon installation, to be used as registration and login credentials on sites supporting TrustShift.
-   **Passwordless Authentication and Session Management**: Allows a challenge-response mechanism for user authentication on websites without traditional password-based methods.

### Planned

-   **Text Submission Encryption**: Allows users to securely submit text through forms on websites. Before submission, the text will be encrypted within the extension, ensuring that sensitive information is never exposed in plaintext during transmission or on the server.
-   **Decryption of Text Content**: Allows automatic decryption of previously submitted encrypted content from web server.

## Installation

TrustShift is currently only supported on Chrome/Chromium browsers

1. Clone the repository or download the extension package.
2. In your browser, navigate to the extensions page (typically `chrome://extensions/`).
3. Enable Developer Mode using the toggle.
4. Click on "Load Unpacked" and select the `extension` directory.

## Usage

After installation, TrustShift will automatically handle the offloading of JavaScript tasks on supported websites.

## Developer Integration

To integrate TrustShift into your website, you need to add specific HTML elements, or "hooks," that the extension can recognize and interact with. These hooks signal to TrustShift to perform actions like initiating authentication procedures or managing encryption tasks.

### Signup and Login Hooks

To enable user signups and logins through TrustShift, include the following forms with their respective IDs:

**Signup Form Hook**:
Embed a form with the ID `TrustShift-SignupForm` for signup operations. TrustShift will listen for form submissions to trigger the user registration process. A username field with the ID `TrustShift-SignupFormUsername` must also be included for the extension to pass the username value along in a registration request.

```html
<form id="TrustShift-SignupForm">
    <input type="text" id="TrustShift-SignupFormUsername" required />
    <!-- Other fields -->
    <button type="submit">Sign Up</button>
</form>
```

**Login Form Hook**:
For login, use a form with the ID `TrustShift-LoginForm`. When this form is submitted, TrustShift will handle the login challenge-response process. A username field with the ID `TrustShift-LoginFormUsername` must also be included for the extension to pass the username value along in a challenge request.

```html
<form id="TrustShift-LoginForm">
    <input type="text" id="TrustShift-LoginFormUsername" required />
    <!-- Other fields -->
    <button type="submit">Login</button>
</form>
```

### Data Sent to API Endpoints

When interacting with TrustShift, the following data is sent to your website's API:

-   **Login Challenges**: When a user attempts to log in, TrustShift sends a JSON object containing the `username` to the `/get_challenge` endpoint via a POST request. Your API is expected to respond with a JSON object that includes a "challenge" field. This field should contain a cryptographically random series of bytes encoded as a Base64 string, which TrustShift will use to create a signed response.

-   **Verifying Signed Challenges**: To verify the login, TrustShift POSTs a JSON object to the `/verify_challenge` endpoint, which includes the `username` and the `challengeResponse` keys. `challengeResponse` contains the user's signed challenge, encoded in Base64. Your API should verify the signature using the user's public key, which should be stored server-side. Upon successful verification, your API should respond with a session token or a confirmation of the user's authentication (session token storage in development).

-   **User Registration**: During user registration, TrustShift sends a JSON object to the `/register` endpoint containing the `username`, and the user's public keys (`sign_key` and `enc_key`) in PEM format. Your API should store these keys associated with the user's account to facilitate future authentication and encrypted communication. After successful registration, the API should return a success status; otherwise, it should provide an error message detailing why the registration failed.

## Testing with Dockerized Websites

Within the `test_sites` directory are website/backend examples created for testing purposes. Please refer to the [README.md](./test_sites/README.md) file in `test_sites` for more information on how to use these examples.

## TODO

### Extension

-   Support any number of additional custom fields during signup/login which are passed along to the website
-   Support per-website key generation
-   Provide libraries to abstract away backend implementation details
-   Support customizable endpoint route names based on hook element content

### Documentation

-   Add more thorough details on developer endpoint functionality requirements and best practices
-   Add additional documentation on backend implementation details for multiple languages/frameworks

### Testing

-   Add additional example websites for multiple langauges/frameworks
