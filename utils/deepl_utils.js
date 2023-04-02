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
  // const MAX_CHR = 1024;
  // const apikey = `DeepL-Auth-Key ${process.env.deepl_apikey}`;
  // const reqs = [];
  // let chrCount = 0;
  // for (let i = 0; i < pageText.length; ++i) {
  //   // if exceed 1024, slice excess
  //   const textToAdd = pageText[i].slice(0, MAX_CHR);
  //   // new req object once chr exceeds 1024
  //   if (reqs.length == 0 || chrCount + textToAdd.length > MAX_CHR) {
  //     reqs.push({
  //       body: new FormData(),
  //       headers: { 'Content-Type': 'multipart/form-data', 'Authorization': apikey }
  //     });
  //     console.log(chrCount);
  //     chrCount = 0;
  //     reqs[reqs.length - 1].body.append('target_lang', 'EN');
  //   }
  //   // add text to param
  //   reqs[reqs.length - 1].body.append('text', textToAdd);
  //   chrCount += textToAdd.length;
  // }
  // console.log(chrCount);

  // build requests (test)
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
  
  // request
  // const res_list = await Promise.all(reqs.map((req) =>
  //   axios.post('https://api-free.deepl.com/v2/translate', req.body, { headers: req.headers })));
  // for (let i = 0; i < res_list.length; ++i) {
  //   console.log('-');
  //   console.log(JSON.stringify(res_list[i].data));
  // }

  // mock data
  const res_list = [];
  const rawText = fs.readFileSync('data/deepl_data_rawkuma.json', 'utf8');
  const data = JSON.parse(rawText);
  for (let i = 0; i < data.length; ++i) {
    res_list.push({ data: data[i] });
  }

  // write results to text file (debug)
  // const toSave = [];
  // for (let i = 0; i < res_list.length; ++i) {
  //   toSave.push(res_list[i].data);
  // }
  // fs.writeFile('data/deepl_data_rawkuma.json', JSON.stringify(toSave), err => {
  //   if (err) {
  //     reject(err);
  //   }
  // });

  // parse data
  const retList = [];
  res_list.map((res) => {
    res.data.translations.map((translation) => {
      retList.push(translation.text);
    });
  });
  return retList;
}