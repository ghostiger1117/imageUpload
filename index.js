const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const API_URL = 'https://ggqf78dg9muf3f-3000.proxy.runpod.net/prompt';

// CHANGE THIS TO YOUR NODE ID
const imageinputNodeIds = [6, 14]; // The node that takes the prompt and image
const promptInputNodeIds1 = [66,68,70];
const promptInputNodeIds2 = [67,69,71];

// POST /generate-image
app.post('/generate-image', upload.single('image'), async (req, res) => {
    try {
        // Validate input
        // if (!req.body.prompt || !req.file) {
        //     return res.status(400).json({ error: 'Prompt and image are required.' });
        // }
        // const userPrompt = req.body.prompt;
        console.log(req.body.prompt1);
        console.log(req.body.prompt2);
        // Read workflow JSON
        let workflow = JSON.parse(fs.readFileSync('Result.json', 'utf8'));

        // Read image file and encode as base64
        const imageBuffer = fs.readFileSync(req.file.path);
        const imageBase64 = imageBuffer.toString('base64');

        // Insert prompt and image into the correct node
        // for (const node of workflow.nodes) {
        //     if (node.id === targetNodeId) {
        //         node.inputs.prompt = userPrompt;
        //         node.inputs.image = imageBase64; // Adjust the key if your node expects another name
        //     }
        // }
        workflow.nodes.map((node) => {
            if(imageinputNodeIds.indexOf(node.id) !== -1) {
                node.inputs.image = imageBase64;
            }
        });
        workflow.nodes.map((node) => {
            if(promptInputNodeIds1.indexOf(node.id) !== -1) {
                node.widgets_values[1] = req.body.prompt1;
            }
        });
        workflow.nodes.map((node) => {
            if(promptInputNodeIds2.indexOf(node.id) !== -1) {
                node.widgets_values[1] = req.body.prompt2;
            }
        });
        console.log(workflow.nodes.map((node, index) => {
            return {id : node.id, value : node.widgets_values};
        }));
        // Call ComfyUI API on RunPod
        const comfyResponse = await axios.post(API_URL, workflow);

        // Optionally: Clean up uploaded image
        fs.unlinkSync(req.file.path);

        // Return the API response to the frontend
        res.json({
            message: 'Workflow submitted!',
            comfyui_response: comfyResponse.data
        });
    } catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});