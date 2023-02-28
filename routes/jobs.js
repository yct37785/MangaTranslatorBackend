import express from 'express';
const router = express.Router();
import { makeSimpleQuery } from '../modules/mysql.js';

/**
 * submit new job
 */
router.post('/submit', async (req, res) => {
  let data = req.body;
  try {
    const jobID = 'testing';
    // do OCR and translation

    res.status(200).json(jobID);
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
    const jobID = 'testing';
    // poll db for transcription with job ID
    
    res.status(200).json(jobID);
  } catch (e) {
    res.status(400).json('Bad request');
  }
});