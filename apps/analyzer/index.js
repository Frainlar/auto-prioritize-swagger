import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import ejsMate from 'ejs-mate';
import { analyzeStoryWithLLM } from './agent.js'; // keep your agent.js as before

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

const analyzedStore = []; // [{id,title,summary,tags,analysis:{...},createdAt}]

app.get('/', (req, res) => {
  res.render('index', { results: analyzedStore });
});

app.get('/detail/:id', (req, res) => {
  const item = analyzedStore.find(x => x.id === req.params.id);
  if (!item) return res.status(404).send('Not Found');
  res.render('detail', { item });
});

app.post('/webhook', async (req, res) => {
  try {
    const payload = req.body || {};
    if (payload.event !== 'story_created' || !payload.item?.title) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const story = {
      id: payload.item.id || uuid(),
      title: payload.item.title,
      summary: payload.item.summary || '',
      tags: payload.item.tags || []
    };
    const analysis = await analyzeStoryWithLLM(story);
    const record = { ...story, analysis, createdAt: new Date().toISOString() };
    analyzedStore.unshift(record);
    res.json({ ok: true, id: record.id, analysis });
  } catch {
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Analyzer running on http://localhost:${PORT}`);
});
