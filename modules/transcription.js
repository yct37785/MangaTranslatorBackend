import axios from 'axios';
import vision from '@google-cloud/vision';
import fs from 'fs';
import FormData from 'form-data';

/**
 * vision OCR
 */
async function visionOCR(img_b64s) {
  // requests
  // const imgRequests = img_b64s.map((b64) => {
  //   return {
  //     image: { content: Buffer.from(b64, 'base64') },
  //     features: [{ type: 'TEXT_DETECTION' }]
  //   }
  // });
  // const request = {
  //   requests: imgRequests
  // };
  // // detect text Vision API
  // const client = new vision.ImageAnnotatorClient();
  // const [result] = await client.batchAnnotateImages(request);
  // mock text data
  const result = { responses: [] };
  const data = fs.readFileSync('data/vision_data_rawkuma.json', 'utf8');
  result.responses = JSON.parse(data).responses;
  // write results to text file (debug)
  // fs.writeFile('data/vision_data_rawkuma.json', JSON.stringify(result), err => {
  //   if (err) {
  //     reject(err);
  //   }
  // });
  return result.responses.map((res) => res.fullTextAnnotation);
}

/**
 * parse raw Vision transcript into:
 * + page: sentences
 * + + block: sentence + \n
 */
function parseTranscription(fullTextAnnotations) {
  const pageText = [];
  const blockVerts = [];
  fullTextAnnotations.map((page) => {
    pageText.push('');
    page.pages[0].blocks.map((block) => {
      let blockStr = '';
      // block level text
      for (let i = 0; i < block.paragraphs.length; ++i) {
        for (let j = 0; j < block.paragraphs[i].words.length; ++j) {
          for (let k = 0; k < block.paragraphs[i].words[j].symbols.length; ++k) {
            const symbol = block.paragraphs[i].words[j].symbols[k];
            blockStr += symbol.text;
            let type = '';
            if (symbol.property && symbol.property.detectedBreak) {
              type = symbol.property.detectedBreak.type;
            }
            if (type == 'LINE_BREAK' || type == 'SPACE' || type == 'EOL_SURE_SPACE') {
              blockStr += ' ';
            }
          }
        }
      }
      // console.log('+' + blockStr + '+');
      pageText[pageText.length - 1] += blockStr + '\n';
      blockVerts.push(block.boundingBox.vertices);
    });
    console.log('Chr count: ' + pageText[pageText.length - 1].length);
  });
  return { pageText: pageText, blockVerts: blockVerts };
}

/**
 * Deepl translation
 * to save resources, bunch multiple pages into one request
 * each page to a text param
 */
async function deeplTranslation(pageText) {
  // build requests
  const apikey = `DeepL-Auth-Key ${process.env.deepl_apikey}`;
  // const reqs = [];
  // let chrCount = 0;
  // for (let i = 0; i < pageText.length; ++i) {
  //   // new req object
  //   if (reqs.length == 0 || chrCount + pageText[i].length > 1024) {
  //     reqs.push({
  //       body: new FormData(),
  //       headers: { 'Content-Type': 'multipart/form-data', 'Authorization': apikey }
  //     });
  //     chrCount = pageText[i].length;
  //     reqs[reqs.length - 1].body.append('target_lang', 'EN');
  //   }
  //   // add text to param
  //   reqs[reqs.length - 1].body.append('text', pageText[i]);
  // }
  // test
  const reqs = [];
  reqs.push({
    body: new FormData(),
    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': apikey }
  });
  reqs[reqs.length - 1].body.append('target_lang', 'DE');
  reqs[reqs.length - 1].body.append('text', 'good morning');
  reqs[reqs.length - 1].body.append('text', 'good afternoon');
  reqs.push({
    body: new FormData(),
    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': apikey }
  });
  reqs[reqs.length - 1].body.append('target_lang', 'DE');
  reqs[reqs.length - 1].body.append('text', 'good evening');
  reqs[reqs.length - 1].body.append('text', 'good night');
  // axios.post(url, fd, { headers: {} })
  const res_list = await Promise.all(reqs.map((req) =>
    axios.post('https://api-free.deepl.com/v2/translate', req.body, { headers: req.headers })));
  for (let i = 0; i < res_list.length; ++i) {
    console.log('-');
    console.log(JSON.stringify(res_list[i].data));
  }
}

/**
 * processes the images -> transcriptions and store it in the DB
 * it is up to the client to poll for any updates
 */
export function processTranscription(job_id, img_b64s) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Job: " + job_id);
      console.log("Total imgs: " + img_b64s.length);
      console.log("Begin OCR...");
      const fullTextAnnotations = await visionOCR(img_b64s);
      console.log("OCR completed, total of " + fullTextAnnotations[0].pages[0].blocks.length + " blocks detected");
      const transcriptData = parseTranscription(fullTextAnnotations);
      console.log("Begin translation...");
      await deeplTranslation(transcriptData.pageText);
      resolve();
    } catch(e) {
      reject(e);
      console.log("processTranscription error:", JSON.stringify(e));
    }
  });
}