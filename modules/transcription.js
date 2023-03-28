import { imageOCR } from '../utils/vision_utils.js';
import { deeplTranslation } from '../utils/deepl.js';
import { uploadDataToCloud } from '../utils/gcloud.js';

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
 * Store bulk transcription into cloud storage
 */
async function cloudStorage(job_id) {
  // create a json file and upload to cloud
  const testData = { test1: 'test1', test2: 'test2', test3: 'test3' };
  await uploadDataToCloud(`${job_id}.json`, JSON.stringify(testData));
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
      const fullTextAnnotations = await imageOCR(img_b64s);
      console.log("OCR completed, total of " + fullTextAnnotations[0].pages[0].blocks.length + " blocks detected");
      const transcriptData = parseTranscription(fullTextAnnotations);
      console.log("Begin translation...");
      await deeplTranslation(transcriptData.pageText);
      console.log("Store data to cloud...");
      await cloudStorage(job_id);
      resolve();
    } catch(e) {
      reject(e);
      console.log("processTranscription error:", JSON.stringify(e));
    }
  });
}