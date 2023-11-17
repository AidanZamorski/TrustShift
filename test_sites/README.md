# Test Sites

## Introduction

The `test_sites` directory contains a collection of example websites designed to test various functionalities of TrustShift. Each site is set up to simulate a specific aspect of the extension's interaction with a web page, such as user signup, login, etc.

## Included Example Sites

-   **Basic Form**: A simple static site without an API, used to test the extension's ability to detect and handle signup hooks.

-   **Basic Login**: A minimal Flask web application that tests the extension's registration and login flow, including challenge generation and verification of signed challenges.

## Using the test.sh Script

The `test.sh` script is a utility for managing Docker containers for each test site. It simplifies the process of building, running, and tearing down backends of various languages and frameworks, and eliminates the need to install unrelated tools on your machine.

### Requirements

-   Docker
-   Docker Compose

### Usage

To use the script, navigate to the `test_sites` directory and run:

```bash
./test.sh <site_name> [options]
```

-   `<site_name>`: The name of the site directory you wish to manage.
-   `[options]`: Additional arguments:
    -   `--remove-image` or `-r`: Remove the Docker image after stopping the container.

The script is designed to handle interruptions gracefully, such that if you interrupt the script with `Ctrl+C` (SIGINT), it will stop the running containers and remove the Docker image if the flag was provided.

### Examples

To start the "basic_form" site:

```bash
./test.sh basic_form
```

To start the "basic_login" site and remove the image after use:

```bash
./test.sh basic_login --remove-image
```

## Adding a New Website

To add a new website for testing:

1.  Create a new directory within `test_sites` with a descriptive name for your site.
2.  Include a `docker-compose.yml` file configured to set up the Docker environment for your site, and ensure that the file builds and serves your site correctly. Convention is to map whatever web server is running in the container to port 8080. The `docker-compose.yml` must define a `web` service which the `test.sh` script will start.

That's it!

## Contributing

Contributions to the example sites are welcome. Please follow the existing structure for consistency and ensure that new sites include comprehensive documentation for their intended test scenarios.
