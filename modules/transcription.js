import vision from '@google-cloud/vision';
import fs from 'fs'

/**
 * vision OCR
 */
async function visionOCR(img_b64s) {
  // requests
  const imgRequests = img_b64s.map((b64) => {
    return {
      image: { content: Buffer.from(b64, 'base64') },
      features: [{ type: 'TEXT_DETECTION' }]
    }
  });
  const request = {
    requests: imgRequests
  };
  // detect text Vision API
  // const client = new vision.ImageAnnotatorClient();
  // const [result] = await client.batchAnnotateImages(request);
  // mock text data
  const result = { responses: [] };
  const data = fs.readFileSync('data/vision_data_rawkuma.json', 'utf8');
  result.responses = JSON.parse(data).responses;
  console.log(result.responses);
  // write results to text file (debug)
  // fs.writeFile('data/vision_data_rawkuma.json', JSON.stringify(result), err => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  return result.responses.map((res) => res.fullTextAnnotation);
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
      const fullTextAnnotations = await visionOCR(img_b64s);
      console.log(fullTextAnnotations[0].pages[0].blocks.length);
      resolve();
    } catch(e) {
      reject(e);
    }
  });
}