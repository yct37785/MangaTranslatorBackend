import express from 'express';
const router = express.Router();
import { createNewJob, getJobData } from '../modules/jobUtils.js';
import { processTranscription } from '../modules/transcription.js';

/**
 * submit new job
 */
router.post('/submit', async (req, res) => {
  try {
    let data = req.body;
    // retrive img base64 strs
    const total_imgs = data.totalPages;
    let img_b64s = [];
    for (let i = 0; i < total_imgs; ++i) {
      img_b64s.push(data[i.toString()]);
    }
    // create job
    const job_id = await createNewJob();
    // do OCR and translation async
    processTranscription(job_id, img_b64s);
    // return job ID immediately
    res.status(200).json({ job_id: job_id });
  } catch (e) {
    console.log("/submit error:", JSON.stringify(e));
    res.status(400).json('Bad request');
  }
});

/**
 * check status of job ID
 */
router.post('/status', async (req, res) => {
  let data = req.body;
  try {
    // poll db for status

    res.status(200).json(retData);
  } catch (e) {
    console.log("/status error:", JSON.stringify(e));
    res.status(400).json('Bad request');
  }
});

/**
 * get transcription from job ID
 */
router.get('/transcription', async (req, res) => {
  console.log(JSON.stringify(req.query));
  let job_id = req.query.job_id;
  try {
    // poll storage for transcription with job ID
    res.status(200).json(await getJobData(job_id));
  } catch (e) {
    console.log("/transcription error:", JSON.stringify(e));
    res.status(400).json('Bad request');
  }
});

export default router;