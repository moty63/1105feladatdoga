import express from 'express';
import dotenv from 'dotenv';
import konyvekRouter from './routes/konyvek.js';
import olvasokRouter from './routes/olvasok.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/konyvek', konyvekRouter);
app.use('/api/olvasok', olvasokRouter);

const port = process.env.PORT || 3350;

app.get('/', (req, res) => {
  res.send('helo vilag');
});

app.listen(port, () => {
  console.log(`a server fut a http://localhost:${port}`);
});
