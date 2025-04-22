const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static('./'));

// Endpoint to handle logging
app.post('/log', (req, res) => {
  const { logEntry } = req.body;
  
  // Append to log file
  fs.appendFile('player_logs.txt', logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
      res.status(500).json({ error: 'Failed to write to log file' });
      return;
    }
    res.json({ message: 'Logged successfully' });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 