import express from 'express';
const router = express.Router();
import { createNewJob } from '../modules/jobUtils.js';
import { processTranscription } from '../modules/transcription.js';

/**
 * submit new job
 */
router.post('/submit', async (req, res) => {
  try {
    let data = req.body;
    // retrive img blobs
    const total_imgs = data.totalPages;
    let img_blobs = [];
    for (let i = 0; i < total_imgs; ++i) {
      img_blobs.push(data[i.toString()]);
    }
    // create job
    const job_id = await createNewJob();
    // do OCR and translation async
    processTranscription(job_id, img_blobs);
    // return job ID immediately
    res.status(200).json({ job_id: job_id });
  } catch (e) {
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
    res.status(400).json('Bad request');
  }
});

/**
 * get transcription from job ID
 */
router.post('/transcription', async (req, res) => {
  let data = req.body;
  try {
    const job_id = 'testing';
    // poll db for transcription with job ID
    
    res.status(200).json(job_id);
  } catch (e) {
    res.status(400).json('Bad request');
  }
});

export default router;