import express from 'express';
import 'dotenv/config';
const app = express();
// routes
// utils
// express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(process.env.port, () => {
  console.log(`Listening on port ${process.env.port}`);
});