// HawkerPing Backend — v1.0
// This receives an SMS keyword and saves the subscriber

require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// This is our simple in-memory subscriber list
// (We'll replace this with a real database later)
const subscribers = [];

// This is the keywords buyers can text in
const validKeywords = ['KENKEY', 'BREAD', 'WATER', 'FISH', 'RICE'];

// Africa's Talking hits this endpoint when someone sends an SMS
app.get('/incoming-sms', (req, res) => {
 const from = req.query.from || req.body.from;
const text = (req.query.text || req.body.text)?.trim().toUpperCase();

  console.log(`SMS received from ${from}: ${text}`);

  // Check if the keyword is valid
  if (validKeywords.includes(text)) {
    // Save the subscriber
    const alreadySubscribed = subscribers.find(
      s => s.phone === from && s.category === text
    );

    if (!alreadySubscribed) {
      subscribers.push({ phone: from, category: text });
      console.log(`New subscriber: ${from} → ${text}`);
      console.log('All subscribers:', subscribers);
    } else {
      console.log(`${from} is already subscribed to ${text}`);
    }
  } else {
    console.log(`Unknown keyword: ${text}`);
  }

  // Africa's Talking expects this response
  res.set('Content-Type', 'text/plain');
  res.send('');
});

// Simple check to confirm server is running
app.get('/', (req, res) => {
  res.json({ 
    status: 'HawkerPing is running',
    subscribers: subscribers 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HawkerPing server running on port ${PORT}`);
});