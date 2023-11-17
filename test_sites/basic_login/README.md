# Basic Login

The "basic_login" example is a minimal web application with a Flask backend, designed to test the sign-up and login hook functionalities of TrustShift. It includes an `index.html` to navigate to the login or sign-up pages, and `login.html` and `signup.html` templates that contain the necessary HTML elements TrustShift targets to perform user registration and login.

## Flask Application Routes and Corresponding Hooks

-   **Index Route (`/`)**: Serves the `index.html` template, which is the main page for navigation.
-   **Signup Route (`/signup`)**: Serves the `signup.html` template. This page contains the signup form, which acts as a hook for TrustShift to register new users.
-   **Login Route (`/login`)**: Serves the `login.html` template. This page contains the login form, which acts as a hook for TrustShift to authenticate users.
-   **Register API Route (`/register`)**: Handles the POST request made by TrustShift when a new user is registered using the signup hook.
-   **Challenge API Route (`/get_challenge`)**: Generates and returns a cryptographic challenge when TrustShift requests it via the login hook, initiating the challenge-response mechanism.
-   **Verify Challenge API Route (`/verify_challenge`)**: Verifies the signed challenge submitted by TrustShift as part of the user authentication process during login.

## Contents

-   `templates/`: Directory containing HTML templates that incorporate TrustShift hooks for the Flask app.
    -   `index.html`: Main page that provides navigation to the login and signup pages.
    -   `login.html`: HTML form to test the TrustShift login process.
    -   `signup.html`: HTML form to test the TrustShift signup process.
-   `app.py`: Flask application to serve the HTML templates and simulate a web server.
-   `docker-compose.yml`: Docker Compose configuration to serve this example site.
-   `Dockerfile`: Defines the container image for the Flask application.
-   `requirements.txt`: Lists the Python dependencies required by the Flask application.
