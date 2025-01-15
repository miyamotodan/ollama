import { Ollama } from 'ollama';
import fs from 'fs';
import { publishRDF } from './publishRDF.js';
import dotenv from 'dotenv';
//dotenv.config();

async function chatWithStreaming(ollama, model, messages) {
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

async function chatWithoutStreaming(ollama, model, messages) {
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

async function sendPrompt(modelName, prompt, context) {

    // Instanzia Ollama
    var ollama;
    if (process.env.OLLAMA_URL)
        ollama = new Ollama({ host: process.env.OLLAMA_URL }) // remote
    else
        ollama = new Ollama(); // Locale (default)

    // se viene passato il file di context deve sostituirlo in system
    let promptContent = fs.readFileSync(prompt, 'utf8');
    if (context != null) {
        const contextContent = fs.readFileSync(context, 'utf8');
        // Sostituisce il placeholder §CONTEXT§ con il valore di context
        promptContent = promptContent.replace(/§CONTEXT§/g, contextContent);
    }

    const userMessages = [
        {
            role: 'user',
            content: promptContent
        },
    ];

    const startTime = new Date();
    console.log(`Start time: ${startTime.toLocaleTimeString()}`);

    const res = await chatWithStreaming(ollama, modelName, userMessages);

    const endTime = new Date();
    const timeDiff = (endTime - startTime) / 1000; // Tempo in secondi
    const minutes = Math.floor(timeDiff / 60); // Minuti

    if (res) {
        fs.writeFileSync(process.env.OUTPUT_FILE, res);
        console.log("Risultato salvato in output.txt");
    }

    console.log(`End time: ${endTime.toLocaleTimeString()}`);
    console.log(`Time taken: ${timeDiff} seconds (${minutes} minutes)`);

}

export { sendPrompt };

// Esempio di utilizzo
//const modelName = process.env.OLLAMA_MODEL_TO; // Nome del modello
//const prompt = process.env.OLLAMA_PROMPT; // Percorso del file di input
//await sendPrompt(modelName, prompt);
