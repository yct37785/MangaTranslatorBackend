import { imageOCR } from '../utils/vision_utils.js';
import { deeplTranslation } from '../utils/deepl_utils.js';
import { uploadDataToCloud } from '../utils/gcloud.js';
import fs from 'fs';

/**
 * parse raw Vision transcript into:
 * + pageText[i]: sentences in one string
 * + + block text = corr. line of pageText[i]
 */
function parseTranscription(visionData) {
  const pageText = [];
  const pageBlockVerts = [];
  visionData.map((page) => {
    pageText.push('');
    pageBlockVerts.push([]);
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
      blockStr = blockStr.replaceAll('\n', '');
      pageText[pageText.length - 1] += blockStr + '\n';
      pageBlockVerts[pageBlockVerts.length - 1].push(block.boundingBox.vertices);
    });
    console.log('Chr count: ' + pageText[pageText.length - 1].length);
  });
  return { pageText: pageText, pageBlockVerts: pageBlockVerts };
}

/**
 * parse final transcription data
 */
function parseFinalTranscript(deeplData, pageBlockVerts) {
  const pageData = [];
  for (let i = 0; i < deeplData.length; ++i) {
    pageData.push([]);
    const blockText = deeplData[i].split('\n');
    for (let j = 0; j < blockText.length; ++j) {
      // console.log(blockText[j]);
      pageData[pageData.length - 1].push({ text: blockText[j], bb: pageBlockVerts[i][j] })
    }
  }
  return pageData;
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
      /* OCR */
      console.log("Begin OCR...");
      const visionData = await imageOCR(img_b64s);
      console.log("OCR completed");
      /* parse */
      const transcriptData = parseTranscription(visionData);
      /* deepl */
      console.log("Begin translation...");
      const deeplData = await deeplTranslation(transcriptData.pageText);
      console.log("Translation completed");
      /* parse */
      const pageData = parseFinalTranscript(deeplData, transcriptData.pageBlockVerts);
      /* cloud */
      console.log("Store data to cloud...");
      await uploadDataToCloud(`${job_id}.json`, JSON.stringify(pageData));
      fs.writeFile('data/ready_data_rawkuma.json', JSON.stringify(pageData, undefined, 2), err => {
        if (err) {
          reject(err);
        }
      });
      console.log("Cloud store completed");
      resolve();
    } catch(e) {
      reject(e);
      console.log("processTranscription error:", JSON.stringify(e));
    }
  });
}