BASE_DIR="$(dirname "$0")"
SITE_NAME="$1"
SITE_DIR="$BASE_DIR/$SITE_NAME"
COMPOSE_FILE="$SITE_DIR/docker-compose.yml"
SERVICE_NAME="web"


# Check to make sure site exists
if [ ! -d "$SITE_DIR" ]; then
    echo "The site \"$SITE_NAME\" does not exist. Exiting..."
    exit 1
fi 

# Check if the docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "The docker-compose file for \"$SITE_NAME\" does not exist. Exiting..."
    exit 1
fi

# Check for command-line arguments
if [ -z "$SITE_NAME" ]; then
    echo "No site specified. Please specify a site to run. Exiting..."
    exit 1
fi

# Function to check if the container is already running
is_container_running() {
    running=$(docker-compose -f "$COMPOSE_FILE" ps -q "$SERVICE_NAME" | wc -l)
    if [ "$running" -ne 0 ]; then
        echo "A container for $SITE_NAME is already running."
        exit 1
    fi
}

# Function to cleanup when script exits or is interrupted
cleanup() {
    echo "Stopping containers for $SITE_NAME..."
    # Record image hash before container removed if we are removing the image
    IMAGE_HASH=$(docker-compose -f "$COMPOSE_FILE" images -q "$SERVICE_NAME")

    docker-compose -f "$COMPOSE_FILE" down

    if [ "$REMOVE_IMAGE" == "true" ]; then
        echo "Removing image for $SITE_NAME..."
        # Remove the image used by the service
        docker rmi "$IMAGE_HASH"
    fi
}

# Setup trap for SIGINT (Ctrl+C) and for script exit
trap 'cleanup' SIGINT

# Default REMOVE_IMAGE to false unless --remove-image flag is provided
REMOVE_IMAGE=false
# Check for flags indicating the removal of the image
if [ "$2" == "--remove-image" ] || [ "$2" == "-r" ]; then
    REMOVE_IMAGE=true
fi

# Function to run the Docker container
run_container() {
    echo "Running container for $SITE_NAME..."
    # Run the container in the foreground
    docker-compose -f "$COMPOSE_FILE" up --build "$SERVICE_NAME"
}

# Check if the container is already running
is_container_running

# Start the container
run_container
