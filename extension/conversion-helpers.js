/**
 * Converts an ArrayBuffer to a string using UTF-16 encoding.
 *
 * @param {ArrayBuffer} buffer - The ArrayBuffer object to be converted.
 * @returns {string} - The resulting string from the conversion.
 */
export const arrayBufferToString = (buffer) => {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
};

/**
 * Converts an ArrayBuffer to a Base64 encoded string.
 *
 * @param {ArrayBuffer} buffer - The buffer to convert.
 * @returns {Promise<string>} - The Base64 encoded string.
 */
export const arrayBufferToBase64 = (buffer) => {
    return new Promise((resolve, reject) => {
        const blob = new Blob([buffer], { type: "application/octet-binary" });
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Converts a Base64 encoded string to an ArrayBuffer.
 *
 * @param {string} base64 - The Base64 encoded string to be converted.
 * @returns {ArrayBuffer} - The ArrayBuffer representation of the input Base64 string.
 */
export const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};
