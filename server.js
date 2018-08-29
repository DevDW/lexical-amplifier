
const express = require('express');
const app = express();
const Request = require('request');
const port = process.env.PORT || 5000;

const Excel = require('exceljs');

// dotenv is being used to protect API credentials. To obtain an API key for Oxford Dictionaries, visit https://developer.oxforddictionaries.com/?tag=#plans.
require('dotenv').config();

// The route is the word property of the req.params object and is equal to whatever query the user enters on the front-end. A credentialed request is then sent to the Oxford Dictionaries API. The response is converted to JSON, sent to the front-end, and fed, along with the word, into the storeResults function for further processing.
app.get('/:word', (req, res) => {
    Request.get('https://od-api.oxforddictionaries.com/api/v1/entries/en/' + req.params.word, {
        port: 443,
        headers: {
            app_id: process.env.APP_ID,
            app_key: process.env.APP_KEY,
        }
    }, (err, response) => {
        try {
            let firstStep = JSON.parse(response.body);
            res.send(firstStep); 
            storeResults(req.params.word, firstStep);
        } catch(err) {
            res.end();
        }
    })
})

// Create an array to store a session's queried words and their definitions.
const storedResults = [];

function storeResults(word, firstStep) {
    let entry = [
        word
    ]; // create an array for each query containing the queried word and its definitions

    // loop through the nested objects and arrays of firstStep (the API response that was converted to JSON) to isolate the definitions
    let jsonDepth1 = firstStep['results'][0]['lexicalEntries'];
            for(let i=0; i < jsonDepth1.length; i++) {
                let jsonDepth2 = jsonDepth1[i]['entries'][0]['senses'];
                for(let j = 0; j < jsonDepth2.length; j++) {
                    let jsonDepth3 = jsonDepth2[j]['definitions'];
                    for(let k = 0; k < jsonDepth3.length; k++) {
                        let definition = jsonDepth3[k].trim();

                        entry.push(definition);
                    }
                }
            }
    
    storedResults.push(entry);
}

// Create the Excel file.
function generateSpreadsheet() {
    try {
        const workbook = new Excel.Workbook();

        workbook.creator = 'Lexical Amplifier';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet("Definitions");

        worksheet.columns = [
            { header: 'Word', key: 'word', width: 36 },
            { header: 'Definition(s)', key: 'def', width: 120 }
        ];

        worksheet.getCell('A1').font = {
            bold: true
        }
        worksheet.getCell('A1').alignment = {
            horizontal: 'center'
        }
        worksheet.getCell('A1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{ argb:'FFFFFF00' },
            bgColor:{ argb:'FFFFFF00' }
        }

        worksheet.getCell('B1').font = {
            bold: true,
            color: { argb: 'FFFFFFFF'}
        }
        worksheet.getCell('B1').alignment = {
            horizontal: 'center'
        }
        worksheet.getCell('B1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{ argb:'FF002060' },
            bgColor:{ argb:'FF002060' }
        }

        worksheet.addRows(storedResults);

        workbook.xlsx.writeFile('Lexical_Amplifier_Results.xlsx');
    } catch(err) {
        console.log(err);
    }
}

// When user on front-end clicks the "Export Results" button, it triggers a request to this path to generate the Excel file.
app.get('/downloads/results', (req, res) => {
    try {
        generateSpreadsheet();
    } catch(err) {
        console.log(err);
    }
})

app.listen(port, () => console.log(`Listening on port ${port}`)); // can delete the console.log