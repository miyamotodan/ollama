//TODO : 16/01/2025
//è cambiata l'API create dalla versione >=5.5 di ollama quindi va riscritto il codice 
//sembra che anche la libreria ollama.js abbia recepito, va capito come farla funzionare

import { Ollama } from 'ollama';
import fs from 'fs';

const ollama = new Ollama(); // Locale (default)

const modelfile = `FROM llama3.2
PARAMETER num_ctx 4200
PARAMETER seed 0
PARAMETER temperature 0.0
SYSTEM """

"""`;

(async () => {
    try {
        await ollama.create({ model: 'test', modelfile: modelfile });
        console.log('Modello creato con successo.');
    } catch (error) {
        console.error('Errore durante la creazione del modello:', error);
    } finally {
        
    }
})();
