import { Storage } from '@google-cloud/storage';

/**
 * Store bulk transcription into cloud storage
 * filename: include ext
 * data: str
 */
export async function uploadDataToCloud(filename, data) {
  const storage = new Storage();
  const bucket = storage.bucket(process.env.gc_bucket_name);
  const file = bucket.file(filename);
  await file.save(data);
}