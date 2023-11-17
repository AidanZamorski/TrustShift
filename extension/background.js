import { generateRsaOaepKeyPair, generateRsaPssKeyPair, exportRsaPublicKeyToPem } from "./crypto-helpers.js";

chrome.runtime.onInstalled.addListener(async () => {
    const encryptionKeyPair = await generateRsaOaepKeyPair();
    const signingKeyPair = await generateRsaPssKeyPair();

    const jwkEncryptionPublicKey = await crypto.subtle.exportKey("jwk", encryptionKeyPair.publicKey);
    const pemEncryptionPublicKey = await exportRsaPublicKeyToPem(encryptionKeyPair.publicKey);
    const jwkEncryptionPrivateKey = await crypto.subtle.exportKey("jwk", encryptionKeyPair.privateKey);

    const jwkSigningPublicKey = await crypto.subtle.exportKey("jwk", signingKeyPair.publicKey);
    const pemSigningPublicKey = await exportRsaPublicKeyToPem(signingKeyPair.publicKey);
    const jwkSigningPrivateKey = await crypto.subtle.exportKey("jwk", signingKeyPair.privateKey);

    chrome.storage.local.set({
        jwkEncryptionPublicKey: jwkEncryptionPublicKey,
        pemEncryptionPublicKey: pemEncryptionPublicKey,
        jwkEncryptionPrivateKey: jwkEncryptionPrivateKey,
        jwkSigningPublicKey: jwkSigningPublicKey,
        pemSigningPublicKey: pemSigningPublicKey,
        jwkSigningPrivateKey: jwkSigningPrivateKey,
    });
});
