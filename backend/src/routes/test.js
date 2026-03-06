cat > src/routes/test.js << 'EOF'
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Test route is working!', 
    time: new Date().toISOString()
  });
});

export default router;