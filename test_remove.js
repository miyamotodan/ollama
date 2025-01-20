import { Ollama } from 'ollama';
import dotenv from 'dotenv';
import fs from 'fs';

//const ollama_url = "http://192.168.1.44:11434";
const ollama_url = null;
const model_name = "llama3.1"


var ollama;
if (ollama_url) {
    ollama = new Ollama({ host: ollama_url }) // remote
}
else {
    ollama = new Ollama(); // Locale (default)
}

/*
(async () => {
    try {
        await ollama.delete({ model: model_name });
        console.log('Modello eliminato con successo.');
    } catch (error) {
        console.error('Errore durante la rimozione del modello:', error);
    } finally {

    }
})();
*/

setTimeout(printList, 1000);

async function printList() {

    let list = await ollama.list();
    list.models.forEach(item => {
        console.log(`Name: ${item.name}, Size: ${item.size} (${(item.size / 1024 / 1024 / 1024).toFixed(1)} GB), ${item.details.family}, ${item.details.quantization_level}`);
    });

}

