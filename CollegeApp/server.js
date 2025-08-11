const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const port = 3001;

// Serve static files from the current directory
app.use(express.static(__dirname));
app.use(bodyParser.json());

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'UniStartupBoard.html'));
});

app.post('/api/data', (req, res) => {
  const { key, data } = req.body;
  fs.writeFileSync(path.join(__dirname, `data/${key}.json`), JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

app.get('/api/data', (req, res) => {
  const key = req.query.key;
  const filePath = path.join(__dirname, `data/${key}.json`);
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(fileData));
  } else {
    res.json([]);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 