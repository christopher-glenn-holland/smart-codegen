import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    REPO_PATH = os.getenv('REPO_PATH')
    CONTEXT_TEXT = os.getenv('CONTEXT_TEXT')

    if not OPENAI_API_KEY:
        raise ValueError("Error: OPENAI_API_KEY environment variable not set.")
    if not REPO_PATH:
        raise ValueError("Error: REPO_PATH environment variable not set.")
    if not CONTEXT_TEXT:
        raise ValueError("Error: CONTEXT_TEXT environment variable not set.")
