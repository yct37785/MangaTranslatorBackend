import vision from '@google-cloud/vision';
import fs from 'fs';
const IMG_PER_REQ = 16;
const client = new vision.ImageAnnotatorClient();

/**
 * do vision API calls
 */
async function callVision(img_b64s) {
  // detect text Vision API
  const imgRequests = img_b64s.map((b64) => {
    return {
      image: { content: Buffer.from(b64, 'base64') },
      features: [{ type: 'TEXT_DETECTION' }]
    }
  });
  const request = {
    requests: imgRequests
  };
  const [result] = await client.batchAnnotateImages(request);
  return result;
}

/**
 * vision OCR
 * img_b64s: list of images in b64 format
 */
export async function imageOCR(img_b64s) {

  // call api batch by batch
  const batches = [[]];
  for(let i = 0; i < img_b64s.length; ++i) {
    if (batches[batches.length - 1].length == IMG_PER_REQ) {
      batches.push([]);
    }
    batches[batches.length - 1].push(img_b64s[i]);
  }
  const res_list = await Promise.all(batches.map((batch) => callVision(batch)));
  const result = { responses: [] };
  for (let i = 0; i < res_list.length; ++i) {
    result.responses = result.responses.concat(res_list[i].responses);
  }
  // mock text data
  // const result = { responses: [] };
  // const data = fs.readFileSync('data/vision_data_rawkuma.json', 'utf8');
  // result.responses = JSON.parse(data).responses;

  // write results to text file (debug)
  fs.writeFile('data/vision_data_rawkuma.json', JSON.stringify(result), err => {
    if (err) {
      reject(err);
    }
  });
  
  return result.responses.map((res) => res.fullTextAnnotation);
}