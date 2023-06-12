const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ dest: './images' });

app.post('/upload', upload.single('avatar'), (req, res) => {
  console.log('file log:', req.file);
  res.send('File uploaded successfully');
});

app.listen(3001, () => {
  console.log('Server running on port 3000');
});