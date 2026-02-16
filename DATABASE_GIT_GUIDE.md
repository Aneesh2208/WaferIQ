# 📚 Database & Git Integration Guide

## How the Database Works

Your wafer analysis database has **TWO storage locations**:

1. **Browser localStorage** (auto-saves every analysis)
   - Persists across sessions
   - Lives in your browser
   - ❌ NOT included in git

2. **Project file** `data/wafer-database-seed.json`
   - Can be committed to git
   - Loads on fresh deployments
   - ✅ Shareable across machines

## 🚀 How to Push Trained Data to Git

### Method 1: Using UI Buttons (Easiest)

1. **Run multiple production cycles** (build your database)
   - AI learns from each analysis
   - Database grows with every run

2. **Click "💾 Export DB" button** (top of Wafer Map)
   - Downloads `wafer-database-backup-[timestamp].json`
   - Contains all your trained cases

3. **Replace the seed file:**
   ```bash
   # Copy downloaded file to project
   cp ~/Downloads/wafer-database-backup-*.json data/wafer-database-seed.json
   ```

4. **Commit to git:**
   ```bash
   git add data/wafer-database-seed.json
   git commit -m "Update trained database with [X] cases"
   git push
   ```

### Method 2: Using Browser Console

```javascript
// Export database
WaferDatabase.export()

// Check database size
console.log(`Cases: ${WaferDatabase.cases.length}`)

// View statistics
WaferDatabase.getStatisticalInsights()
```

## 🌱 How Database Loads on New Machines

When someone clones your repo and opens the app:

```
1. Page loads → WaferDatabase.init()
2. Loads from localStorage (empty on first run)
3. Loads from data/wafer-database-seed.json (your committed data)
4. Merges both (no duplicates)
5. Ready with pre-trained knowledge! ✅
```

## 📊 Check Database Status

**UI Button:** Click "📊 DB Stats"
- Shows total cases
- Edge/center/hybrid pattern statistics
- Severity distribution
- Common diagnoses

**Console:**
```javascript
WaferDatabase.cases.length  // Total cases
WaferDatabase.getStatisticalInsights()  // Full statistics
```

## 🔄 Workflow Example

### Day 1: Build Initial Database
```bash
# Run 10-20 production cycles
# Database auto-saves to localStorage
# Export before ending work
```

### Day 1 Evening: Commit to Git
```bash
# Click "Export DB" button
# Save as data/wafer-database-seed.json
git add data/wafer-database-seed.json
git commit -m "Initial trained database (20 cases)"
git push
```

### Day 2: Continue Training
```bash
# Pull latest code
git pull

# Open app → Database loads 20 cases from seed file
# Run 10 more cycles → Now 30 cases total
# Export again
git add data/wafer-database-seed.json
git commit -m "Expand database to 30 cases"
git push
```

### New Team Member
```bash
# Clone repo
git clone [your-repo]

# Open app
# Automatically loads all 30 trained cases!
# Starts with pre-trained AI intelligence ✅
```

## 🎯 Best Practices

### When to Export/Commit

✅ **DO export and commit when:**
- End of work session (backup your progress)
- After training on diverse patterns (share learning)
- Before major code changes (safety backup)
- Reached milestones (100 cases, 500 cases, etc.)

❌ **DON'T commit after:**
- Every single analysis (too many commits)
- Test runs with fake data (pollutes database)

### Keep Database Clean

```javascript
// If database gets polluted with test data:
WaferDatabase.clear()  // Clears everything

// Then reload seed data:
location.reload()  // Reloads from seed file
```

## 📦 Database File Structure

```json
[
  {
    "id": "WF-1234567890-abc123",
    "timestamp": "2024-12-21T10:30:00.000Z",
    "waferData": { ... },
    "defectData": { ... },
    "spatialFeatures": {
      "failureRate": 0.35,
      "edgeConcentration": 0.72,
      "centerConcentration": 0.15,
      ...
    },
    "aiDiagnosis": "Edge Die Failure with thermal gradient",
    "rootCauses": [...],
    "reasoning": [...],
    "confidence": 87,
    ...
  },
  ...
]
```

## 🔧 Troubleshooting

**Problem: Database not loading from seed file**
```javascript
// Check if seed file exists
fetch('data/wafer-database-seed.json')
  .then(r => r.json())
  .then(data => console.log(`Seed has ${data.length} cases`))
```

**Problem: Database too large (>5MB)**
```javascript
// Keep only recent cases
WaferDatabase.cases = WaferDatabase.cases.slice(-500)  // Last 500
localStorage.setItem('waferDatabase', JSON.stringify(WaferDatabase.cases))
```

**Problem: Want to merge two databases**
```javascript
// Import additional cases from file
const input = document.createElement('input')
input.type = 'file'
input.accept = '.json'
input.onchange = e => WaferDatabase.importFromFile(e.target.files[0])
input.click()
```

## 🎓 Summary

**Data Flow:**
```
Your Browser localStorage → Export Button → JSON File → Git → Other Machines
                ↓                                                    ↓
         Auto-saves analyses                              Loads on startup
```

**Key Points:**
- ✅ Database persists in browser (won't lose data)
- ✅ Export to commit trained data to git
- ✅ Seed file loads on new deployments
- ✅ AI gets smarter with every analysis
- ✅ Share intelligence across team via git

**Remember:** The more you analyze, the smarter the AI gets! 🧠✨
