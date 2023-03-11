import express from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';
const app = express();
var upload = multer();
// routes
import jobsRoute from './routes/jobs.js';
// parsing specifications setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(upload.array());  // multipart/form-data

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
})

/* set routing */
app.use('/job', jobsRoute);

app.listen(process.env.port, () => {
  console.log(`Listening on port ${process.env.port}`);
});