// HawkerPing Backend — v1.0
// This receives an SMS keyword and saves the subscriber

require('dotenv').config();
const express = require('express');
const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const sms = at.SMS;
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
// HAWKER BIG BUTTON
// When a hawker taps "I'm Here", this fires a missed call to all subscribers
app.get('/hawker-ping', async (req, res) => {
  const category = req.query.category?.toUpperCase();
  const hawkerName = req.query.name || 'Your hawker';

  if (!category) {
    return res.json({ success: false, message: 'No category provided' });
  }

  // Find all subscribers for this category
  const targets = subscribers.filter(s => s.category === category);

  if (targets.length === 0) {
    return res.json({ 
      success: false, 
      message: `No subscribers found for ${category}` 
    });
  }

  // For now we simulate the missed call — real calls come next session
  console.log(`🔔 ${hawkerName} is nearby selling ${category}!`);
  console.log(`Firing missed calls to ${targets.length} subscribers:`);
  const phones = targets.map(sub => {
  let phone = sub.phone.trim();
  if (!phone.startsWith('+')) {
    phone = '+' + phone;
  }
  return phone;
});

try {
  const result = await sms.send({
    to: phones,
    message: `🔔 ${hawkerName} is nearby selling ${category}! Step outside now!`,
  });
  console.log(`✅ SMS sent!`, JSON.stringify(result));
} catch (err) {
  console.log('Using username:', process.env.AT_USERNAME);
console.log('API Key starts with:', process.env.AT_API_KEY?.substring(0, 8));
  console.log(`❌ Real error:`, err.message);
}

  res.json({
    success: true,
    message: `Pinged ${targets.length} subscribers for ${category}`,
    subscribers_alerted: targets.length,
    hawker: hawkerName,
    category: category
  });
});
app.listen(PORT, () => {
  console.log(`HawkerPing server running on port ${PORT}`);
});