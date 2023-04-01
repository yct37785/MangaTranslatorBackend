import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

/**
 * Deepl translation
 * to save resources, bunch multiple pages into one request
 * each page to a text param
 */
export async function deeplTranslation(pageText) {
  // build requests
  const MAX_CHR = 1024;
  const apikey = `DeepL-Auth-Key ${process.env.deepl_apikey}`;
  const reqs = [];
  let chrCount = 0;
  for (let i = 0; i < pageText.length; ++i) {
    // new req object once chr exceeds 1024
    if (reqs.length == 0 || chrCount + pageText[i].length > MAX_CHR) {
      reqs.push({
        body: new FormData(),
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': apikey }
      });
      console.log(chrCount);
      chrCount = 0;
      reqs[reqs.length - 1].body.append('target_lang', 'EN');
    }
    // add text to param
    if (pageText[i].length < MAX_CHR) {
      reqs[reqs.length - 1].body.append('text', pageText[i]);
      chrCount += pageText[i].length;
    }
  }

  // test
  // const reqs = [];
  // reqs.push({
  //   body: new FormData(),
  //   headers: { 'Content-Type': 'multipart/form-data', 'Authorization': apikey }
  // });
  // reqs[reqs.length - 1].body.append('target_lang', 'DE');
  // reqs[reqs.length - 1].body.append('text', 'good morning');
  // reqs[reqs.length - 1].body.append('text', 'good afternoon');
  // reqs.push({
  //   body: new FormData(),
  //   headers: { 'Content-Type': 'multipart/form-data', 'Authorization': apikey }
  // });
  // reqs[reqs.length - 1].body.append('target_lang', 'DE');
  // reqs[reqs.length - 1].body.append('text', 'good evening');
  // reqs[reqs.length - 1].body.append('text', 'good night');
  // // axios.post(url, fd, { headers: {} })
  // const res_list = await Promise.all(reqs.map((req) =>
  //   axios.post('https://api-free.deepl.com/v2/translate', req.body, { headers: req.headers })));
  // for (let i = 0; i < res_list.length; ++i) {
  //   console.log('-');
  //   console.log(JSON.stringify(res_list[i].data));
  // }
}