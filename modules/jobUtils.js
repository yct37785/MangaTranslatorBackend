import { makeSimpleQuery } from '../utils/mysql.js';
import { retriveDataFromCloud } from '../utils/gcloud.js';
import { v4 as uuidv4 } from 'uuid';

export async function createNewJob() {
  return new Promise(async (resolve, reject) => {
    try {
      const job_id = uuidv4();
      const curr_epoch = Date.now() / 1000;
      const query = `insert into job (job, status, start_epoch, completed_epoch) values (?, ?, ?, ?)`;
      const params = [job_id, false, curr_epoch, 0];
      await makeSimpleQuery(query, params);
      resolve(job_id);
    } catch (e) {
      console.log("createNewJob error:", JSON.stringify(e));
    }
  });
}

export async function markJobCompleted(job_id) {
  return new Promise(async (resolve, reject) => {
    try {
      const curr_epoch = Date.now() / 1000;
      const query = `update job set completed_epoch = ? where job = ?`;
      const params = [curr_epoch, job_id];
      await makeSimpleQuery(query, params);
      resolve(job_id);
    } catch (e) {
      console.log("markJobCompleted error:", JSON.stringify(e));
    }
  });
}

export async function getJobData(job_id) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await retriveDataFromCloud(`${job_id}.json`));
    } catch (e) {
      console.log("getJobData error:", JSON.stringify(e));
    }
  });
}