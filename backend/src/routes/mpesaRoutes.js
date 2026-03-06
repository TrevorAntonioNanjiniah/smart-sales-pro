const express = require('express');
const router = express.Router();

router.post('/stkpush', (req, res) => {
  res.json({ message: 'STK Push endpoint' });
});

router.post('/callback', (req, res) => {
  res.json({ message: 'M-Pesa callback endpoint' });
});

router.get('/status/:transactionId', (req, res) => {
  res.json({ message: 'Transaction status endpoint' });
});

module.exports = router;
