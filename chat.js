import { Ollama } from 'ollama';
import fs from 'fs';
import { publishRDF } from './publishRDF.js';
import dotenv from 'dotenv';
dotenv.config();

// Instanzia Ollama
var ollama;
if(process.env.OLLAMA_URL)
    ollama = new Ollama({ host: process.env.OLLAMA_URL}) // remote
else
    ollama = new Ollama(); // Locale (default)


async function chatWithStreaming(model, messages) {
    let res = "";

    try {
        // Inizializza la chat con lo streaming abilitato
        const responseStream = await ollama.chat({
            model, // Nome del modello
            messages, // Array di messaggi
            stream: true, // Abilita lo streaming
        });

        // Legge i chunk dallo stream (assumendo che sia un Async Iterable)
        for await (const chunk of responseStream) {
            res += chunk.message.content; // Accumula i dati
            process.stdout.write(chunk.message.content); // Stampa i dati progressivamente senza andare a capo
        }

        console.log("\nStream completato.");
        return res; // Ritorna il contenuto accumulato
    } catch (err) {
        console.error("Errore durante lo streaming:", err);
    }
}

async function chatWithoutStreaming(model, messages) {
    try {
        const response = await ollama.chat({
            model, // Nome del modello
            messages, // Array di messaggi
            stream: false, // Disabilita lo streaming
        });

        console.log(response.message.content);
        console.log("\nChat completata.");
        return response.message.content; // Ritorna il contenuto della risposta
    } catch (err) {
        console.error("Errore nella chat:", err);
    }
}

// Esempio di utilizzo
const modelName = process.env.OLLAMA_MODEL_TO; // Nome del modello
const userMessages = [
    {
        role: 'user',
        content: fs.readFileSync(process.env.OLLAMA_PROMPT, 'utf8')
    },
];

(async () => {

    const startTime = new Date();
    console.log(`Start time: ${startTime.toLocaleTimeString()}`);

    const res = await chatWithStreaming(modelName, userMessages);

    const endTime = new Date();
    const timeDiff = (endTime - startTime) / 1000; // Tempo in secondi
    const minutes = Math.floor(timeDiff / 60); // Minuti

    if (res) {
        fs.writeFileSync(process.env.OUTPUT_FILE, res);
        console.log("Risultato salvato in output.txt");
    }

    console.log(`End time: ${endTime.toLocaleTimeString()}`);
    console.log(`Time taken: ${timeDiff} seconds (${minutes} minutes)`);

    console.log(`loading in triplestore`);
    // Carica il file RDF nel repository GraphDB
    await publishRDF(process.env.OUTPUT_FILE , process.env.REPOSITORY_URL, process.env.REPOSITORY_ID , process.env.REPOSITORY_GRAPH, true);
    console.log(`Done`);


})();
