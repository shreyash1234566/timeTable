const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Initialize Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY');
  console.error('Add these to your .env file');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Default data structure
const defaultData = {
  currentDay: 1,
  dayTasks: {},
  todos: [],
  dailyChecks: {},
  timeLog: {},
  topicLog: {},
  mocks: [],
  lastUpdated: null
};

// Get table name based on user type
function getTableName(userType) {
  if (userType === 'user1') return 'user1_progress';
  if (userType === 'user2') return 'user2_progress';
  throw new Error('Invalid user type');
}

// ============ LOGIN ROUTE ============
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    res.json({
      success: true,
      user: {
        username: data.username,
        userType: data.user_type
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Load data from Supabase for specific user
async function loadData(userType) {
  try {
    const tableName = getTableName(userType);
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ? data.data : { ...defaultData };
  } catch (err) {
    console.error('Error loading data:', err);
    return { ...defaultData };
  }
}

// Save data to Supabase for specific user
async function saveData(userType, data) {
  try {
    const tableName = getTableName(userType);
    data.lastUpdated = new Date().toISOString();

    const { error } = await supabase
      .from(tableName)
      .upsert(
        { id: 1, data, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error saving data:', err);
    return false;
  }
}

// ============ API ROUTES ============

// GET - Load all progress data for user
app.get('/api/progress', async (req, res) => {
  try {
    const userType = req.query.userType;
    if (!userType) {
      return res.status(400).json({ success: false, message: 'User type required' });
    }
    const data = await loadData(userType);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load data' });
  }
});

// POST - Save all progress data for user
app.post('/api/progress', async (req, res) => {
  try {
    const userType = req.query.userType;
    if (!userType) {
      return res.status(400).json({ success: false, message: 'User type required' });
    }
    const data = req.body;
    if (await saveData(userType, data)) {
      res.json({ success: true, message: 'Progress saved!' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update specific field for user
app.put('/api/progress/:field', async (req, res) => {
  try {
    const userType = req.query.userType;
    if (!userType) {
      return res.status(400).json({ success: false, message: 'User type required' });
    }
    const { field } = req.params;
    const { value } = req.body;
    const data = await loadData(userType);

    if (field in data) {
      data[field] = value;
      if (await saveData(userType, data)) {
        res.json({ success: true, message: `${field} updated!` });
      } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid field' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET - Statistics summary for user
app.get('/api/stats', async (req, res) => {
  try {
    const userType = req.query.userType;
    if (!userType) {
      return res.status(400).json({ success: false, message: 'User type required' });
    }
    const data = await loadData(userType);

    // Calculate stats
    const totalTasksDone = Object.keys(data.dayTasks).filter(k => data.dayTasks[k]).length;
    const totalMocks = data.mocks.length;
    const avgScore = totalMocks > 0
      ? Math.round(data.mocks.reduce((s, m) => s + m.score, 0) / totalMocks)
      : 0;

    let totalTime = 0;
    Object.values(data.timeLog).forEach(t => {
      totalTime += (t.morning || 0) + (t.evening || 0) + (t.night || 0);
    });

    const daysWithChecks = Object.keys(data.dailyChecks).length;

    res.json({
      success: true,
      stats: {
        currentDay: data.currentDay,
        totalTasksDone,
        totalMocks,
        avgScore,
        totalTimeMinutes: totalTime,
        totalTimeHours: Math.round(totalTime / 60 * 10) / 10,
        daysTracked: daysWithChecks,
        lastUpdated: data.lastUpdated
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

// DELETE - Reset all data for user
app.delete('/api/progress', async (req, res) => {
  try {
    const userType = req.query.userType;
    if (!userType) {
      return res.status(400).json({ success: false, message: 'User type required' });
    }
    if (await saveData(userType, { ...defaultData })) {
      res.json({ success: true, message: 'All data reset!' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to reset' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Export data as downloadable JSON for user
app.get('/api/export', async (req, res) => {
  try {
    const userType = req.query.userType;
    if (!userType) {
      return res.status(400).json({ success: false, message: 'User type required' });
    }
    const data = await loadData(userType);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=afcat-progress-${userType}-backup.json`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export' });
  }
});

module.exports = app;
