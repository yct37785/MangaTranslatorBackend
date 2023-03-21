import vision from '@google-cloud/vision';
import fs from 'fs'

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
  const data = fs.readFileSync('data/vision_data_mangadex.json', 'utf8');
  result.responses = JSON.parse(data).responses;
  // write results to text file (debug)
  // fs.writeFile('data/vision_data_mangadex.json', JSON.stringify(result), err => {
  //   if (err) {
  //     reject(err);
  //   }
  // });
  return result.responses.map((res) => res.fullTextAnnotation);
}

/**
 * parse raw Vision transcript into block level text
 */
function parseTranscription(fullTextAnnotations) {
  const blockText = [];
  fullTextAnnotations.map((page) => {
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
      console.log(blockStr);
      blockText.push({ text: blockStr, vertices: block.boundingBox.vertices});
    });
  });
  return blockText;
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
      const blockText = parseTranscription(fullTextAnnotations);
      console.log("Begin translation...");
      resolve();
    } catch(e) {
      reject(e);
      console.log("processTranscription error:", JSON.stringify(e));
    }
  });
}