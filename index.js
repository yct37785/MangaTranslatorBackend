import express from 'express';
import 'dotenv/config';
const app = express();
// routes
import jobsRoute from './routes/jobs.js';
// utils
// express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
})

/* set routing */
app.use('/job', jobsRoute);

app.listen(process.env.port, () => {
  console.log(`Listening on port ${process.env.port}`);
});