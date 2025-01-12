import { Ollama } from 'ollama';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

var ollama;
if(process.env.OLLAMA_URL)
    ollama = new Ollama({ host: process.env.OLLAMA_URL}) // remote
else
    ollama = new Ollama(); // Locale (default)

let m_from = process.env.OLLAMA_MODEL_FROM;

const systemContent = fs.readFileSync(process.env.OLLAMA_SYSTEM, 'utf8');

// 'qwen2.5-coder:14b', 'yi-coder:9b-chat-q8_0', 'qwen2.5-coder:7b-instruct-q8_0', 'qwen2.5-coder:14b-instruct-q8_0', 'llama3.2'
const modelfile = `
FROM ${process.env.OLLAMA_MODEL_FROM}
PARAMETER num_ctx ${process.env.OLLAMA_NUM_CTX}
PARAMETER seed ${process.env.OLLAMA_SEED}
PARAMETER temperature ${process.env.OLLAMA_TEMPERATURE}
SYSTEM """
${systemContent}
"""
`
let list = await ollama.list();
let m = list.models.filter(m => m.name === process.env.OLLAMA_MODEL_TO);
if (m.length>0) await ollama.delete({ model: process.env.OLLAMA_MODEL_TO});
await ollama.create({ model: process.env.OLLAMA_MODEL_TO, modelfile: modelfile });

list.models.forEach(item => {
    console.log(`Name: ${item.name}, Size: ${item.size}`);
});



