import vision from '@google-cloud/vision';

/**
 * processes the images -> transcriptions and store it in the DB
 * it is up to the client to poll for any updates
 */
export async function processTranscription(job_id, img_blobs) {
  console.log("Job: " + job_id);
  console.log("Total img blobs: " + img_blobs.length);
  // blob
  const request = {
    image: {
      content: Buffer.from(img_blobs[0], 'binary')
    }
  };
  // detect text
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.textDetection(request);
  const detections = result.textAnnotations;
  console.log('Text:');
  detections.forEach(text => console.log(text));
  console.log('End text');
}