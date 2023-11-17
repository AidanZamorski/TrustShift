(async () => {
    try {
        const src = chrome.runtime.getURL("crypto-helpers.js");
        const helpers = await import(src);
        const { requestLoginChallenge, signLoginChallenge, submitLoginChallengeResponse, submitSignupRequest } =
            helpers.default;

        let signupForm = document.getElementById("TrustShift-SignupForm");
        if (signupForm) {
            signupForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                const username = document.getElementById("TrustShift-SignupFormUsername").value;
                const origin = new URL(document.location).origin;
                await submitSignupRequest(username, origin);
            });
        }

        let loginForm = document.getElementById("TrustShift-LoginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                const username = document.getElementById("TrustShift-LoginFormUsername").value;
                const origin = new URL(document.location).origin;

                // Request a login challenge for the given username
                const challenge = await requestLoginChallenge(username, origin);
                console.log(challenge.byteLength);
                // Sign the login challenge using the private key (Base64 output)
                const signedChallenge = await signLoginChallenge(challenge);

                // Submit the signed login challenge response back to the server
                await submitLoginChallengeResponse(username, signedChallenge, origin);
            });
        }
    } catch (e) {
        console.error("Failed to import the required modules", e);
    }
})();
