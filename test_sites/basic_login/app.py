from flask import Flask, jsonify, request, render_template, redirect
import os
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature
from base64 import b64encode, b64decode

app = Flask(__name__, static_folder='static', static_url_path='/static')

# It's better to use a database to handle user data rather than a global variable.
# This is just for demonstration purposes.
app.user_data = {}

@app.route('/')
def index():
    """Serve the index page."""
    return render_template('index.html')

@app.route('/signup')
def signup():
    """Serve the signup page."""
    return render_template('signup.html')

@app.route('/login')
def login():
    """Serve the login page."""
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register_user():
    """Register a new user with their public keys."""
    username = request.form['username']
    sign_public_key_pem = request.form['sign_key']
    enc_public_key_pem = request.form['enc_key']

    if username in app.user_data:
        # Consider returning a message indicating the username is taken.
        return redirect('/signup')

    # TODO: Validate input, store in a real database, handle errors, etc.
    sign_public_key = serialization.load_pem_public_key(sign_public_key_pem.encode('utf-8'))
    enc_public_key = serialization.load_pem_public_key(enc_public_key_pem.encode('utf-8'))

    # "Create User" logic
    # TODO: Implement user creation in the database and proper authentication logic.
    app.user_data[username] = {
        "sign_key": sign_public_key,
        "enc_key": enc_public_key,
        "challenge": None
    }
    # ...

    return redirect('/login')  # Redirect to the login page or confirmation page.

@app.route('/get_challenge', methods=['POST'])
def get_challenge():
    """Generate and return a challenge for the user to sign."""
    username = request.json['username']
    # TODO: Retrieve or generate a challenge from a real database.
    challenge_bytes = os.urandom(32)
    app.user_data[username]["challenge"] = challenge_bytes
    challenge_b64 = b64encode(challenge_bytes).decode('utf-8')

    return jsonify({'challenge': challenge_b64})

@app.route('/verify_challenge', methods=['POST'])
def verify_challenge():
    """Verify the signed challenge returned by the user."""
    username = request.json['username']
    challenge_response = b64decode(request.json['challengeResponse'])

    # Verify the response using the stored public key.
    is_valid = verify_signature(
        username=username, 
        signature_bytes=challenge_response, 
        challenge_bytes=app.user_data[username]["challenge"]
    )

    if is_valid:
        # TODO: Create a session or token for the user.
        # Implement session creation in the database and proper authentication logic.
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Invalid challenge response'}), 401

def verify_signature(username, signature_bytes, challenge_bytes):
    """Verify the digital signature of a challenge using the user's public key."""
    public_key = app.user_data[username]["sign_key"]

    try:
        public_key.verify(
            signature_bytes,
            challenge_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA512()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA512()
        )
        app.logger.info("Signature verified for user: %s", username)
        return True
    except InvalidSignature:
        app.logger.warning("Invalid signature for user: %s", username)
        return False
    except Exception as e:
        app.logger.error("Error during signature verification for user: %s - %s", username, str(e))
        return False

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
