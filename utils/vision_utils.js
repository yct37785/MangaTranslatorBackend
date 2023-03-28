import vision from '@google-cloud/vision';
import fs from 'fs';

/**
 * vision OCR
 * img_b64s: list of images in b64 format
 */
export async function imageOCR(img_b64s) {
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