import openai
import json
import os
import logging
from utils import count_tokens, calculate_cost, build_full_context
from config import Config

openai.api_key = Config.OPENAI_API_KEY
logging.basicConfig(level=logging.DEBUG)

def generate_response(full_context, model="gpt-4o-mini", temperature=0.5, top_p=0.9):
    model_max_tokens = {
        "gpt-4o": 4096,
        "gpt-4o-mini": 16384
    }

    max_tokens = model_max_tokens.get(model, 4096)
    
    input_tokens = count_tokens(full_context, model)
    logging.debug(f"Input tokens: {input_tokens}, Max tokens allowed: {max_tokens}")
    
    if input_tokens >= max_tokens:
        raise ValueError(f"Input tokens exceed the maximum allowed tokens for the model {model}")
    
    max_tokens_for_response = max_tokens - input_tokens
    logging.debug(f"Max tokens for response: {max_tokens_for_response}")
    
    llm_request = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": full_context}
        ],
        "max_tokens": max_tokens_for_response,
        "temperature": temperature,
        "top_p": top_p
    }
    
    response = openai.ChatCompletion.create(**llm_request)
    return response, input_tokens

def process_openai_response(response, model):
    new_response = response.choices[0].message.content
    output_tokens = count_tokens(new_response, model)
    return new_response, output_tokens

def handle_openai_request(file, prompt, model, context='', previous_context='', selected_folder='', root_path=''):
    files = []
    if file:
        file_content = file.read().decode('utf-8')
        files.append({'path': file.filename, 'content': file_content})

    full_context = build_full_context(files, prompt, context, previous_context)
    project_full_path = os.path.join(root_path, selected_folder) if selected_folder else root_path
    context_text = Config.CONTEXT_TEXT.replace('{projectFullPath}', project_full_path)
    full_context = f"{context_text}\n\n{full_context}"

    logging.debug("<<< CHAT START >>>")
    logging.debug(f"Model being used: {model}")  # Log the model being used
    logging.debug("Full context sent to API:")
    logging.debug(full_context)
    
    try:
        response, input_tokens = generate_response(full_context, model)
        new_response, output_tokens = process_openai_response(response, model)

        logging.debug(f"Input tokens: {input_tokens}")
        logging.debug(f"Output tokens: {output_tokens}")

        input_cost = calculate_cost(input_tokens, model, "input")
        output_cost = calculate_cost(output_tokens, model, "output")
        
        logging.debug(f"Input cost: {input_cost}")
        logging.debug(f"Output cost: {output_cost}")

        updated_context = f"{previous_context}\n\nHuman: {prompt}\n\nAssistant: {new_response}".strip()

        logging.debug("<<< RESPONSE >>>")
        logging.debug(new_response)
        logging.debug("<<< CHAT END >>>")

        # Extract the file path if present in the response
        file_path = None
        if "/* File:" in new_response:
            start_index = new_response.index("/* File:") + len("/* File:")
            end_index = new_response.index("*/", start_index)
            file_path = new_response[start_index:end_index].strip()

        # Save the response to lastReceiveResponse.json
        with open('lastReceiveResponse.json', 'w') as f:
            json.dump({
                'response': new_response,
                'context': updated_context,
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'input_cost': f"{input_cost:.8f}",
                'output_cost': f"{output_cost:.8f}",
                'file_path': file_path
            }, f)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'response': new_response,
                'context': updated_context,
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'input_cost': f"{input_cost:.8f}",
                'output_cost': f"{output_cost:.8f}",
                'file_path': file_path
            })
        }
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def handle_download_context(files, prompt, context='', previous_context=''):
    full_context = build_full_context(files, prompt, context, previous_context)
    return full_context
