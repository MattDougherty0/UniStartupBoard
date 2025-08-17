# Production Data Seeding Scripts

This directory contains scripts for seeding production Firestore with new data.

## seedProductionData.js

This script adds SJSU and Santa Clara University data to production Firestore.

### Prerequisites

1. **Firebase Configuration**: You need to add your production Firebase config to the script
2. **Firebase Admin SDK**: Ensure you have access to production Firestore
3. **Node.js**: Version 14 or higher

### Setup

1. **Add Firebase Config**: Edit `seedProductionData.js` and add your production Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

2. **Install Dependencies**: Make sure Firebase is installed:
   ```bash
   npm install firebase
   ```

### Usage

Run the script to seed production data:

```bash
node scripts/seedProductionData.js
```

### What Gets Added

#### Universities
- **San Jose State University** (SJSU)
  - Location: 37.3352, -121.8811
  - Email domain: sjsu.edu
  - City: San Francisco

- **Santa Clara University**
  - Location: 37.3496, -121.9390
  - Email domain: scu.edu
  - City: San Francisco

#### Users (4 total)
- **Jessica Wong** (SJSU) - Computer Engineering, Smart Home Automation
- **Carlos Rodriguez** (SJSU) - Business, FinTech Solutions
- **Sophia Garcia** (SCU) - Environmental Science, Sustainable Agriculture
- **Kevin Chen** (SCU) - Computer Science, AI Education Platform

#### Posts (4 total)
- **Silicon Valley Smart Home** - AI-powered home automation
- **FinTech for Small Business** - Digital banking platform
- **Sustainable Agriculture Network** - Farm-to-consumer platform
- **AI Education Platform** - Personalized learning system

### Safety Features

- Uses `merge: true` to avoid overwriting existing data
- Includes error handling for each operation
- Logs all operations for transparency
- Exits cleanly on completion

### Production Deployment

1. **Test Locally**: First test with a staging Firebase project
2. **Backup**: Ensure you have a backup of production data
3. **Run Script**: Execute the script during low-traffic hours
4. **Verify**: Check that data appears correctly in production

### Troubleshooting

- **Permission Errors**: Ensure your Firebase config has write access
- **Network Issues**: Check your internet connection and Firebase status
- **Data Conflicts**: The script uses merge mode to avoid conflicts

### Rollback

If you need to remove the seeded data, you can manually delete the specific documents from Firestore or create a rollback script.
