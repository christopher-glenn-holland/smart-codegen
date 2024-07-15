from flask import request, jsonify
import json
import os
from utils import count_tokens, calculate_cost, build_tree, build_full_context, fetch_file_content
from openai_handler import handle_openai_request, handle_download_context

exclude_dirs = ["bin", "obj", "node_modules", "packages", "temp", "tempCS", ".next", ".git", "dist", "build", "coverage", "public", ".venv", "venv", "__pycache__"]
exclude_patterns = ["*.min.css", "*.min.js", "*.d.ts", "*.map", "package-lock.json"]

def configure_routes(app, repo_path):
    @app.route('/folders', methods=['GET'])
    def list_folders():
        try:
            folders = [f for f in os.listdir(repo_path) if os.path.isdir(os.path.join(repo_path, f))]
            return jsonify({'folders': folders})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/root_path', methods=['GET'])
    def get_root_path():
        try:
            return jsonify({'rootPath': repo_path})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/folder_tree', methods=['GET'])
    def folder_tree():
        folder_path = request.args.get('path')
        if not folder_path:
            return jsonify({'error': 'Path parameter is missing'}), 400

        abs_folder_path = os.path.join(repo_path, folder_path)
        if not os.path.isdir(abs_folder_path):
            return jsonify({'error': 'Invalid folder path'}), 400

        tree = build_tree(abs_folder_path, exclude_dirs, exclude_patterns)
        return jsonify(tree)

    @app.route('/file_content', methods=['GET'])
    def file_content():
        file_path = request.args.get('path')
        if not file_path:
            return jsonify({'error': 'Path parameter is missing'}), 400

        abs_file_path = os.path.join(repo_path, file_path)
        if os.path.isdir(abs_file_path):
            return jsonify({'error': 'Path is a directory, not a file'}), 400
        if not os.path.isfile(abs_file_path):
            return jsonify({'error': 'Invalid file path'}), 400

        try:
            content = fetch_file_content(abs_file_path)
            return jsonify({'content': content})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/token_count', methods=['POST'])
    def token_count():
        context = request.json.get('context')
        model = request.json.get('model', 'gpt-4o-mini')
        if not context:
            return jsonify({'error': 'Context is missing'}), 400

        input_tokens = count_tokens(context, model)
        input_cost = calculate_cost(input_tokens, model, "input")
        return jsonify({
            'input_tokens': input_tokens,
            'input_cost': input_cost
        })

    @app.route('/process', methods=['POST'])
    def process():
        prompt = request.form['prompt']
        file = request.files.get('file')
        context = request.form['context']
        model = request.form.get('model', 'gpt-4o-mini')
        selected_folder = request.form.get('selectedFolder', '')
        root_path = request.form.get('rootPath', '') # Fetch root path
        result = handle_openai_request(file, prompt, model, context, selected_folder=selected_folder, root_path=root_path)
        return jsonify(result)

    @app.route('/download_context', methods=['POST'])
    def download_context():
        files = request.json.get('files', [])
        prompt = request.json.get('prompt', '')
        context = request.json.get('context', '')
        previous_context = request.json.get('previous_context', '')

        # Fetch the latest content for each file
        for file in files:
            abs_file_path = os.path.join(repo_path, file['path'])
            file['content'] = fetch_file_content(abs_file_path)

        full_context = handle_download_context(files, prompt, context, previous_context)
        return full_context

    @app.route('/write_file', methods=['POST'])
    def write_file():
        try:
            data = request.json
            file_path = data.get('filePath')
            file_content = data.get('fileContent')

            # Ensure the directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            # Write the file
            with open(file_path, 'w') as file:
                file.write(file_content)
            
            print(f"File is being written: {file_path}")

            # Return a success response
            return jsonify({"message": "File written successfully"}), 200
        except Exception as e:
            print(f"Error writing file: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @app.route('/last_response', methods=['GET'])
    def get_last_response():
        if os.path.exists('lastReceiveResponse.json'):
            with open('lastReceiveResponse.json', 'r') as f:
                response_data = json.load(f)
            return jsonify(response_data)
        else:
            return jsonify({'error': 'No last response found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
