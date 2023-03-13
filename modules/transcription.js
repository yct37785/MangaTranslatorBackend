import vision from '@google-cloud/vision';
import fs from 'fs'

/**
 * processes the images -> transcriptions and store it in the DB
 * it is up to the client to poll for any updates
 */
export async function processTranscription(job_id, img_b64s) {
  console.log("Job: " + job_id);
  console.log("Total imgs: " + img_b64s.length);
  // requests
  const imgRequests = img_b64s.map((b64) => {
    return {
      image: { content: Buffer.from(b64, 'base64') },
      features: [{type: 'TEXT_DETECTION'}]
    }
  });
  const request = {
    requests: imgRequests
  };
  // detect text
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.batchAnnotateImages(request);
  // write results to text file
  fs.writeFile('data/vision_data_rawkuma.json', JSON.stringify(result), err => {
    if (err) {
      console.error(err);
    }
  });
}