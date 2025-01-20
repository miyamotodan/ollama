import { Ollama } from 'ollama';
import dotenv from 'dotenv';
import fs from 'fs';
//dotenv.config();

async function createModel(model, system, context) {

    var ollama;
    if (process.env.OLLAMA_URL) {
        ollama = new Ollama({ host: process.env.OLLAMA_URL }) // remote
    }
    else {
        ollama = new Ollama(); // Locale (default)
    }

    // se viene passato il file di context deve sostituirlo in system
    let systemContent = fs.readFileSync(system, 'utf8');
    if (context != null) {
        const contextContent = fs.readFileSync(context, 'utf8');
        // Sostituisce il placeholder §CONTEXT§ con il valore di context
        systemContent = systemContent.replace(/§CONTEXT§/g, contextContent);
    }

    // 'qwen2.5-coder:14b', 'yi-coder:9b-chat-q8_0', 'qwen2.5-coder:7b-instruct-q8_0', 'qwen2.5-coder:14b-instruct-q8_0', 'llama3.2'
    const modelfile = `FROM ${model}
PARAMETER num_ctx ${process.env.OLLAMA_NUM_CTX}
PARAMETER seed ${process.env.OLLAMA_SEED}
PARAMETER temperature ${process.env.OLLAMA_TEMPERATURE}
SYSTEM """
${systemContent}
"""`;
    
    console.log("=========================================")
    console.log(modelfile)
    console.log("=========================================")

    let list = await ollama.list();
    let m = list.models.filter(m => m.name === process.env.OLLAMA_MODEL_TO);
    if (m.length > 0) await ollama.delete({ model: process.env.OLLAMA_MODEL_TO });
    
    //fs.writeFileSync('./model_temp.txt', modelfile);
    //await ollama.create({ model: process.env.OLLAMA_MODEL_TO,  });
    //fs.deleteFileSync('model_temp.txt');

    await ollama.create({ model: process.env.OLLAMA_MODEL_TO, modelfile: modelfile });

    list = await ollama.list();

    list.models.forEach(item => {
        console.log(`Name: ${item.name}, Size: ${item.size} (${(item.size / 1024 / 1024 / 1024).toFixed(1)} GB), ${item.details.family}, ${item.details.quantization_level}`);
    });

}

export { createModel };

//createModel(process.env.OLLAMA_SYSTEM,null);

