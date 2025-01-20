import dotenv from 'dotenv';
import fs from 'fs';
import { createModel } from './create.js';
import { publishRDF } from './publishRDF.js';
import { sendPrompt } from './chat.js'; 
 
dotenv.config({ debug: true, override: true });

//creo il modello
const system = process.env.OLLAMA_SYSTEM;
const systemElements = system.split(',');

const modelfrom = process.env.OLLAMA_MODEL_FROM;
const modelfromElements = modelfrom.split(',');

let i = 0;
while (i < systemElements.length) {
    console.log(`Creating model ${(i+1)} of ${systemElements.length}: ${systemElements[i]} ${modelfromElements[i]}`);
    
    if (i==0) { //summarization 
        await createModel(modelfromElements[i],systemElements[i], null);
        await sendPrompt(process.env.OLLAMA_MODEL_TO, process.env.OLLAMA_PROMPT, null);
    } else
    if (i==1) { //concetti 
        await createModel(modelfromElements[i],systemElements[i], null);
        await sendPrompt(process.env.OLLAMA_MODEL_TO, process.env.OUTPUT_FILE, null);
    } else
    if (i==2) { //OWL 
        await createModel(modelfromElements[i],systemElements[i], null);
        await sendPrompt(process.env.OLLAMA_MODEL_TO, process.env.OUTPUT_FILE, null);
    } 

/* 
    } else
    if (i==2) { //gerarchia
        await createModel(modelfromElements[i],systemElements[i], process.env.OUTPUT_FILE);
        await sendPrompt(process.env.OLLAMA_MODEL_TO, process.env.OUTPUT_FILE+"."+(i-1), null);
    } else { //OWL

        //aggiungo all'output attuale l'output precedente   
        try {
            const data1 = fs.readFileSync(process.env.OUTPUT_FILE, 'utf8');
            const data2 = fs.readFileSync(process.env.OUTPUT_FILE+"."+(i-1), 'utf8');
            fs.writeFileSync(process.env.OUTPUT_FILE, data2+"\n\n"+data1);
        } catch (err) {
            console.error(`Errore durante il salvataggio del file di backup dell'output: ${err}`);
        }

        await createModel(modelfromElements[i],systemElements[i], null);
        await sendPrompt(process.env.OLLAMA_MODEL_TO, process.env.OUTPUT_FILE, null);
    }
**/

    i++;

    //salvo il file prodotto
    try {
        const data = fs.readFileSync(process.env.OUTPUT_FILE, 'utf8');
        fs.writeFileSync(process.env.OUTPUT_FILE+"."+i, data);
    } catch (err) {
        console.error(`Errore durante il salvataggio del file di backup dell'output: ${err}`);
    }

}

    console.log(`loading in triplestore`);
    //Carica il file RDF nel repository GraphDB
    await publishRDF(process.env.OUTPUT_FILE , process.env.REPOSITORY_URL, process.env.REPOSITORY_ID , process.env.REPOSITORY_GRAPH, true);
    console.log(`Done`);
