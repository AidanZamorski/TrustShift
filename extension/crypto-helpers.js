import { arrayBufferToString, arrayBufferToBase64, base64ToArrayBuffer } from "conversion-helpers.js";

const RSA_OPTIONS = {
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-512",
};

/**
 * Asynchronously generates a cryptographic RSA-OAEP key pair for encryption and decryption.
 *
 * @returns {Promise<CryptoKeyPair>} - A promise that resolves with the generated key pair.
 */
export const generateRsaOaepKeyPair = async () => {
    return crypto.subtle.generateKey(
        {
            ...RSA_OPTIONS,
            name: "RSA-OAEP",
        },
        true,
        ["encrypt", "decrypt"]
    );
};

/**
 * Asynchronously generates a cryptographic RSA-PSS key pair for signing and verification.
 *
 * @returns {Promise<CryptoKeyPair>} - A promise that resolves with the generated signing key pair.
 */
export const generateRsaPssKeyPair = async () => {
    return crypto.subtle.generateKey(
        {
            ...RSA_OPTIONS,
            name: "RSA-PSS",
        },
        true,
        ["sign", "verify"]
    );
};

/**
 * Asynchronously exports a public key to PEM format.
 *
 * @param {CryptoKey} key - The public key to be exported.
 * @returns {Promise<string>} - A promise that resolves with the public key in PEM format.
 */
export const exportRsaPublicKeyToPem = async (key) => {
    const exported = await crypto.subtle.exportKey("spki", key);
    const exportedAsString = arrayBufferToString(exported);
    const exportedAsBase64 = btoa(exportedAsString);
    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
};

/**
 * Requests a cryptographic challenge from the server for a given username.
 *
 * @param {string} username - The username for which to request a challenge.
 * @param {string} origin - The origin of the website where the login is occurring.
 * @returns {Promise<ArrayBuffer>} - A promise that resolves with the challenge random bytes.
 */
export const requestLoginChallenge = async (username, origin) => {
    const serverUrl = `${origin}/get_challenge`;
    try {
        const response = await fetch(serverUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Credentials: "include",
            },
            body: JSON.stringify({ username }),
            mode: "cors",
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        return base64ToArrayBuffer(data.challenge);
    } catch (error) {
        console.error("Error requesting challenge:", error);
        throw error;
    }
};

/**
 * Submits the signed challenge to the server for verification.
 *
 * @param {string} username - The username for which the challenge was signed.
 * @param {string} signedChallenge - The Base64 encoded signed challenge string.
 * @param {string} origin - The origin of the website where the login is occurring.
 * @returns {Promise<boolean>} - A promise that resolves to true if the server verified the signed challenge successfully, otherwise false.
 */
export const submitLoginChallengeResponse = async (username, signedChallenge, origin) => {
    const verifyEndpoint = `${origin}/verify_challenge`;
    try {
        const response = await fetch(verifyEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: origin,
            },
            body: JSON.stringify({
                username: username,
                challengeResponse: signedChallenge,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Error submitting signed challenge:", error);
        return false;
    }
};

/**
 * Submits a new user's signup request to the server.
 *
 * @param {string} username - The username of the new user to register.
 * @param {string} origin - The origin URL of the server where the registration endpoint is located.
 * @returns {Promise<boolean>} - A promise that resolves to true if the server successfully registers the user,
 * otherwise resolves to false if the server returns a non-OK response or an error occurs.
 */
export const submitSignupRequest = async (username, origin) => {
    const keys = await getPEMPublicKeys();
    const signupEndpoint = `${origin}/register`;
    try {
        const response = await fetch(signupEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: origin,
            },
            body: JSON.stringify({
                username: username,
                sign_key: keys.sign_key,
                enc_key: keys.enc_key,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Error submitting registration details:", error);
        return false;
    }
};

/**
 * Signs a cryptographic challenge using the user's private RSA signing key.
 *
 * @param {ArrayBuffer} challenge - The challenge ArrayBuffer to be signed.
 * @returns {Promise<string>} - A promise that resolves with the signed challenge.
 */
export const signLoginChallenge = async (challenge) => {
    try {
        const privateKey = await getPrivateRsaSigningKey();
        const signatureBuffer = await crypto.subtle.sign(
            {
                name: "RSA-PSS",
                // The salt length should be equal to the hash output size in bytes (SHA-512)
                saltLength: Math.ceil((4096 - 1) / 8) - 64 - 2, //4096 = key length, 64 = digest output size in bytes (SHA 512)
            },
            privateKey,
            challenge
        );
        return arrayBufferToBase64(signatureBuffer);
    } catch (error) {
        console.error("Error signing challenge:", error);
        throw error;
    }
};

/**
 * Retrieves the private signing key from secure storage.
 *
 * @returns {Promise<CryptoKey>} - A promise that resolves with the CryptoKey representing the private signing key.
 */
const getPrivateRsaSigningKey = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("jwkSigningPrivateKey", (result) => {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError.message));
            }
            const jwkSigningPrivateKey = result.jwkSigningPrivateKey;
            if (jwkSigningPrivateKey) {
                resolve(
                    crypto.subtle.importKey("jwk", jwkSigningPrivateKey, { name: "RSA-PSS", hash: "SHA-512" }, true, [
                        "sign",
                    ])
                );
            } else {
                reject(new Error("Private key not found"));
            }
        });
    });
};

/**
 * Asynchronously retrieves the PEM-formatted public keys for signing and encryption from local storage.
 *
 * @returns {Promise<{sign_key: string, enc_key: string}>} A promise that resolves with an object containing
 * the signing and encryption public keys in PEM format. If the keys are not found or an error occurs,
 * the promise will be rejected with an error message.
 */
const getPEMPublicKeys = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["pemSigningPublicKey", "pemEncryptionPublicKey"], (result) => {
            if (chrome.runtime.lastError) {
                // Reject the promise if there was an error
                reject(new Error(chrome.runtime.lastError.message));
            } else if (result && result.pemSigningPublicKey && result.pemEncryptionPublicKey) {
                // Resolve the promise with the keys if they were found
                resolve({ sign_key: result.pemSigningPublicKey, enc_key: result.pemEncryptionPublicKey });
            } else {
                // Reject the promise if the keys were not found
                reject(new Error("Public keys not found"));
            }
        });
    });
};

export default {
    requestLoginChallenge,
    signLoginChallenge,
    submitLoginChallengeResponse,
    submitSignupRequest,
    generateRsaOaepKeyPair,
    generateRsaPssKeyPair,
    exportRsaPublicKeyToPem,
};
