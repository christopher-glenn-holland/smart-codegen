import tiktoken
import os

def fetch_file_content(file_path):
    with open(file_path, 'r') as file:
        return file.read()

def count_tokens(text, model="gpt-4o-mini"):
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        raise ValueError(f"Model {model} not supported for token counting.")
    
    tokens = encoding.encode(text)
    return len(tokens)

def calculate_cost(tokens, model, token_type):
    rates = {
        "gpt-4o": {"input": 5.00, "output": 15.00},
        "gpt-4o-mini": {"input": 0.150, "output": 0.600}
    }
    if model not in rates:
        raise ValueError(f"Pricing rates for model {model} not defined.")
    
    rate_per_1m_tokens = rates[model][token_type]
    return (tokens / 1_000_000) * rate_per_1m_tokens

def build_full_context(files, prompt, context='', previous_context=''):
    file_contents = "\n\n".join([f"/* File: {file['path']} */\n\n{file['content']}" for file in files])
    if previous_context:
        return f"{previous_context}\n\nHuman: {prompt}\n\n{file_contents}\n\n{context}".strip()
    return f"Human: {prompt}\n\n{file_contents}\n\n{context}".strip()

def is_excluded_dir(path, exclude_dirs):
    return any(exclude in path for exclude in exclude_dirs)

def is_excluded_pattern(filename, exclude_patterns):
    return any(filename.endswith(pattern) for pattern in exclude_patterns)

def build_tree(root, exclude_dirs, exclude_patterns):
    tree = {
        'name': os.path.basename(root),
        'path': root,
        'isDirectory': True,
        'children': []
    }
    try:
        for item in os.listdir(root):
            item_path = os.path.join(root, item)
            if os.path.isdir(item_path):
                if not is_excluded_dir(item_path, exclude_dirs):
                    tree['children'].append(build_tree(item_path, exclude_dirs, exclude_patterns))
            else:
                if not is_excluded_pattern(item, exclude_patterns):
                    tree['children'].append({
                        'name': item,
                        'path': item_path,
                        'isDirectory': False
                    })
    except Exception as e:
        print(f"Error reading directory {root}: {e}")
    return tree
