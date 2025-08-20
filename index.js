const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const { analyzeStory, analyzeMany, summaryMarkdown } = require('./analyze');

const app = express();
app.use(express.json());

const stories = [
  { id: 1, title: 'User login', description: 'As a user I want to log in so that I can access my account.' },
  { id: 2, title: 'Urgent bug fix', description: 'Urgent: fix the payment crash bug.' }
];

// Load OpenAPI document
const openapiDocument = yaml.load(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.get('/stories', (req, res) => {
  res.json({ stories });
});

app.post('/webhook', (req, res) => {
  const { event, item } = req.body || {};
  if (event !== 'item_added' || !item) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const analysis = Array.isArray(item) ? analyzeMany(item) : analyzeStory(item);
  const summary = Array.isArray(analysis) ? summaryMarkdown(analysis) : summaryMarkdown([analysis]);
  res.json({ analysis, summary });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
