import fs from 'fs';
import fetch from 'node-fetch';

async function publishRDF(filePath, repositoryUrl, repositoryId, graphUri = null, clearGraph = false) {
    
    console.log("publishRDF:",filePath, repositoryUrl, repositoryId, graphUri, clearGraph);

    try {
        let rdfData = fs.readFileSync(filePath, 'utf8');
        // Pulisce i dati RDF se necessario
        rdfData = cleanRDFData(rdfData);

        if (clearGraph && graphUri) {
            const clearUrl = `${repositoryUrl}/repositories/${repositoryId}/statements?context=<${encodeURIComponent(graphUri)}>`;
            const clearResponse = await fetch(clearUrl, {
                method: 'DELETE',
            });

            if (!clearResponse.ok) {
                throw new Error(`Errore durante la cancellazione del grafo: ${clearResponse.statusText}`);
            }

            console.log('Grafo cancellato con successo.');
        }

        let url = `${repositoryUrl}/repositories/${repositoryId}/statements`;
        if (graphUri) {
            url += `?context=<${encodeURIComponent(graphUri)}>`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-turtle', // Assumendo che il file RDF sia in formato Turtle
            },
            body: rdfData,
        });

        if (!response.ok) {
            throw new Error(`Errore durante il caricamento del file RDF: ${response.statusText}`);
        }

        console.log('File RDF caricato con successo.');
    } catch (error) {
        console.error('Errore durante il caricamento del file RDF:', error);
    }
}

function cleanRDFData(rdfData) {
    const lines = rdfData.split('\n');
    let startIndex = 0;
    let endIndex = lines.length;

    if (lines[0].trim() === '```turtle') {
        startIndex = 1;
    }

    if (lines[lines.length - 1].trim() === '```') {
        endIndex = lines.length - 1;
    }

    return lines.slice(startIndex, endIndex).join('\n');
}

export { publishRDF };