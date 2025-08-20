import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import ejsMate from 'ejs-mate';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const ANALYZER_WEBHOOK_URL = process.env.ANALYZER_WEBHOOK_URL || 'http://localhost:3000/webhook';

app.get('/', (_req, res) => {
  res.render('index', { result: null, error: null, defaults: { title: '', summary: '', tags: '' } });
});

app.post('/create', async (req, res) => {
  const { title, summary, tags } = req.body;
  const id = `ITEM-${uuid().split('-')[0]}`;
  const payload = {
    event: 'story_created',
    item: {
      id,
      type: 'story',
      title: String(title || '').trim(),
      summary: String(summary || '').trim(),
      tags: String(tags || '').split(',').map(s => s.trim()).filter(Boolean)
    }
  };

  try {
    const { data } = await axios.post(ANALYZER_WEBHOOK_URL, payload, {
      headers: { 'content-type': 'application/json' },
      timeout: 20000
    });
    res.render('result', { result: { id, analysis: data.analysis }, error: null });
  } catch {
    res.render('index', {
      result: null,
      error: 'Failed to call Analyzer webhook. Check URL and ports.',
      defaults: { title, summary, tags }
    });
  }
});

app.post('/webhook', (req, res) => {
  console.log('Inbound webhook to Creator:', req.body);
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Creator running on http://localhost:${PORT}`);
});
