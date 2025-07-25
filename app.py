from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid
import copy

app = Flask(__name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
print("Version 1")
# Ensure uploads directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

CORS(app)
load_dotenv()

prompt_text = "failed"

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error' : 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error' : 'No selected file'}), 400
    current_datetime = datetime.now()
    # Convert the object o Vnix timestamp (f loft represent-ing seconds since epoch)
    timestamp = current_datetime.timestamp()
    # r f you need an integer timestomp (e.g., for some APES)
    integer_timestamp = int(timestamp)
    print(f"Current Timestamp : {str(integer_timestamp)}")
    filename = str(integer_timestamp);
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    print('upload success')
    global cached_workflow
    workflow_path = os.path.join(os.path.dirname(__file__), "successful_api.json")
    with open(workflow_path, "r") as f:
        cached_workflow = json.load(f)
    prompt = copy.deepcopy(cached_workflow)


    # prompt = json.loads(prompt_text)
    #set the text prompt for our positive CLIPTextEncode
    prompt["6"]["inputs"]["image"] = f"../imageUpload/uploads/{filename}"
    prompt["14"]["inputs"]["image"] = f"../imageUpload/uploads/{filename}"
    # prompt["2"]["inputs"]["api_key"] = os.getenv("OPENAI_API_KEY")
    print("prompt", prompt)

    client_id = str(uuid.uuid4())
    p = {"prompt": prompt, "client_id" : client_id}

    data = json.dumps(p).encode('utf-8')
    print("data", data)
    import requests
    resp = requests.post("https://ggqf78dg9muf3f-3000.proxy.runpod.net/prompt", json=p)
    if(resp.status_code != 200):
        raise Exception(f"failed: {prompt_text}")
    response_data = resp.json()
    print("success", response_data)
    return jsonify({'message': 'Image uploaded successfully', 'filename': filename})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1117) 
