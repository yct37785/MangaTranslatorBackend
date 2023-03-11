


/**
 * processes the images -> transcriptions and store it in the DB
 * it is up to the client to poll for any updates
 */
export async function processTranscription(job_id, img_blobs) {
  console.log("Job: " + job_id);
  console.log("Total img blobs: " + img_blobs.length);
}