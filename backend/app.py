from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from routes import configure_routes

# Load environment variables from a .env file
load_dotenv()

# Get the REPO_PATH from environment variables
repo_path = os.getenv('REPO_PATH')
if not repo_path:
    raise ValueError("Error: REPO_PATH environment variable not set.")

# Get the port from environment variables or default to 5999
port = int(os.getenv('FLASK_RUN_PORT', 5999))

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)

configure_routes(app, repo_path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=port)
