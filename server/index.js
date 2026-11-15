const path = require('path');
const express = require('express');
const app = require('./app');
const { initScheduler } = require('./scheduler');
const { startTelegramListener } = require('./telegramBotListener');

const PORT = process.env.PORT || 4000;

// Serve frontend in production if built
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send('RankPulse 24/7 API Server is running. Frontend build in progress...');
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 RankPulse 24/7 SEO Autopilot Server listening on port ${PORT}`);
  console.log(`📡 Multi-Website API available at http://localhost:${PORT}/api/websites`);
  console.log(`=======================================================`);
  
  // Initialize the 24/7 cron scheduler
  initScheduler();

  // Initialize the 24/7 Telegram incoming command listener
  startTelegramListener();
});
