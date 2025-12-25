const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'progress-data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve HTML files

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

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
  return { ...defaultData };
}

// Save data to file
function saveData(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving data:', err);
    return false;
  }
}

// ============ API ROUTES ============

// GET - Load all progress data
app.get('/api/progress', (req, res) => {
  const data = loadData();
  res.json({ success: true, data });
});

// POST - Save all progress data
app.post('/api/progress', (req, res) => {
  const data = req.body;
  if (saveData(data)) {
    res.json({ success: true, message: 'Progress saved!' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save' });
  }
});

// PUT - Update specific field
app.put('/api/progress/:field', (req, res) => {
  const { field } = req.params;
  const { value } = req.body;
  const data = loadData();
  
  if (field in data) {
    data[field] = value;
    if (saveData(data)) {
      res.json({ success: true, message: `${field} updated!` });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid field' });
  }
});

// GET - Statistics summary
app.get('/api/stats', (req, res) => {
  const data = loadData();
  
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
});

// DELETE - Reset all data
app.delete('/api/progress', (req, res) => {
  if (saveData({ ...defaultData })) {
    res.json({ success: true, message: 'All data reset!' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to reset' });
  }
});

// Export data as downloadable JSON
app.get('/api/export', (req, res) => {
  const data = loadData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=afcat-progress-backup.json');
  res.send(JSON.stringify(data, null, 2));
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🎯 AFCAT Progress Tracker Server Running!              ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  📍 Open: http://localhost:${PORT}/progress.html               ║`);
  console.log('║  💾 Data saves to: progress-data.json                      ║');
  console.log('║  🔄 Press Ctrl+C to stop                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
});
