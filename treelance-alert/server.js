require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

let admin;
let firebaseInitialized = false;

try {
  admin = require('firebase-admin');
  const serviceAccount = require('./firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  firebaseInitialized = true;
  console.log('Firebase Admin SDK initialized');
} catch (error) {
  console.warn('Firebase not configured - running in demo mode');
  console.warn('Add firebase-service-account.json to enable real push notifications');
}

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'admin-panel')));

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.JWT_SECRET || 'TREELANCE_SUPER_SECRET_2024';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'treelance2024';

const deviceTokens = new Map();
const alertsHistory = [];

function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, ADMIN_SECRET);
    if (decoded.admin) {
      req.admin = decoded;
      return next();
    }
    res.status(403).json({ error: 'Unauthorized' });
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true, iat: Date.now() }, ADMIN_SECRET, { expiresIn: '12h' });
    res.json({ 
      success: true, 
      token,
      expiresIn: '12 hours'
    });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/register-token', async (req, res) => {
  const { token, userId, platform, deviceInfo } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }
  
  deviceTokens.set(token, {
    token,
    userId: userId || 'anonymous',
    platform: platform || 'unknown',
    deviceInfo: deviceInfo || {},
    registeredAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  });
  
  console.log(`Device registered: ${token.substring(0, 20)}... (Total: ${deviceTokens.size})`);
  res.json({ success: true, message: 'Token registered successfully' });
});

app.delete('/unregister-token', (req, res) => {
  const { token } = req.body;
  
  if (token && deviceTokens.has(token)) {
    deviceTokens.delete(token);
    res.json({ success: true, message: 'Token removed' });
  } else {
    res.status(404).json({ error: 'Token not found' });
  }
});

app.get('/devices', verifyAdmin, (req, res) => {
  const devices = Array.from(deviceTokens.values()).map(d => ({
    ...d,
    token: d.token.substring(0, 20) + '...'
  }));
  
  res.json({
    count: devices.length,
    devices,
    firebaseEnabled: firebaseInitialized
  });
});

app.post('/send-alert', verifyAdmin, async (req, res) => {
  const { title, message, link } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }
  
  const tokens = Array.from(deviceTokens.keys());
  
  if (tokens.length === 0) {
    return res.status(400).json({ 
      error: 'No devices registered',
      message: 'Devices must register first via /register-token'
    });
  }
  
  const alert = {
    id: Date.now().toString(),
    title,
    message,
    link: link || 'https://tr33lance.pro',
    date: new Date().toISOString(),
    sentTo: tokens.length,
    status: 'pending'
  };
  
  if (!firebaseInitialized) {
    alert.status = 'simulated';
    alertsHistory.unshift(alert);
    
    console.log('\n' + '='.repeat(50));
    console.log('🚨 SIMULATED AMBER ALERT 🚨');
    console.log('='.repeat(50));
    console.log(`TITLE: ${title}`);
    console.log(`MESSAGE: ${message}`);
    console.log(`LINK: ${link || 'https://tr33lance.pro'}`);
    console.log(`RECIPIENTS: ${tokens.length} devices`);
    console.log('='.repeat(50) + '\n');
    
    return res.json({
      success: true,
      message: 'Alert simulated (Firebase not configured)',
      totalDevices: tokens.length,
      alert
    });
  }
  
  const payload = {
    notification: {
      title,
      body: message,
      click_action: link || 'https://tr33lance.pro'
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'treelance_emergency',
        sound: 'default',
        priority: 'max',
        visibility: 'public',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      }
    },
    apns: {
      payload: {
        aps: {
          alert: { title, body: message },
          sound: 'default',
          badge: 1,
          'interruption-level': 'time-sensitive'
        }
      },
      headers: {
        'apns-priority': '10'
      }
    },
    webpush: {
      notification: {
        title,
        body: message,
        icon: '/icon-192.png',
        requireInteraction: true
      },
      fcmOptions: {
        link: link || 'https://tr33lance.pro'
      }
    }
  };
  
  try {
    const BATCH_SIZE = 500;
    let successCount = 0;
    let failureCount = 0;
    const invalidTokens = [];
    
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batchTokens = tokens.slice(i, i + BATCH_SIZE);
      
      const response = await admin.messaging().sendEachForMulticast({
        tokens: batchTokens,
        ...payload
      });
      
      successCount += response.successCount;
      failureCount += response.failureCount;
      
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(batchTokens[idx]);
        }
      });
    }
    
    invalidTokens.forEach(t => deviceTokens.delete(t));
    
    alert.status = 'sent';
    alert.successCount = successCount;
    alert.failureCount = failureCount;
    alert.invalidTokensRemoved = invalidTokens.length;
    alertsHistory.unshift(alert);
    
    console.log('\n' + '='.repeat(50));
    console.log('🚨 GLOBAL ALERT SENT 🚨');
    console.log('='.repeat(50));
    console.log(`SUCCESS: ${successCount}/${tokens.length}`);
    console.log(`FAILURES: ${failureCount}`);
    console.log(`INVALID TOKENS CLEANED: ${invalidTokens.length}`);
    console.log('='.repeat(50) + '\n');
    
    res.json({
      success: true,
      message: 'Global alert sent successfully!',
      totalDevices: tokens.length,
      successCount,
      failureCount,
      alert
    });
    
  } catch (err) {
    console.error('Alert send error:', err);
    alert.status = 'failed';
    alert.error = err.message;
    alertsHistory.unshift(alert);
    
    res.status(500).json({ error: 'Error sending alert', details: err.message });
  }
});

app.get('/alerts', verifyAdmin, (req, res) => {
  res.json({
    alerts: alertsHistory.slice(0, 100),
    total: alertsHistory.length
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Tree-Lance Alert Center',
    firebaseEnabled: firebaseInitialized,
    registeredDevices: deviceTokens.size,
    alertsSent: alertsHistory.length,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel', 'index.html'));
});

const PORT = process.env.ALERT_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '🚨'.repeat(20));
  console.log(`\n  TREE-LANCE ALERT CENTER`);
  console.log(`  Running on port ${PORT}`);
  console.log(`  Firebase: ${firebaseInitialized ? '✅ ENABLED' : '⚠️ DEMO MODE'}`);
  console.log(`  Admin Panel: http://localhost:${PORT}`);
  console.log('\n' + '🚨'.repeat(20) + '\n');
});
