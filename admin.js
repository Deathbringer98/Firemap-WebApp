#!/usr/bin/env node
/**
 * Fire Map Admin Tool
 * Manage pending reports, moderate content, and view analytics
 * Usage: node admin.js [command] [options]
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/firemap';

// Report Schema (same as server.js)
const ReportSchema = new mongoose.Schema({
  type: { type: String, enum: ['fire', 'smoke', 'evacuation', 'road_closure'], required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'extreme'], required: true },
  description: { type: String, trim: true, maxLength: 1000, required: true },
  coordinates: {
    latitude: { type: Number, min: -90, max: 90, required: true },
    longitude: { type: Number, min: -180, max: 180, required: true },
  },
  locationString: { type: String, required: true },
  contactInfo: { type: String, trim: true, maxLength: 100 },
  submissionData: {
    ipAddress: String,
    userAgent: String,
    geoLocation: { country: String, region: String, city: String, timezone: String },
    timestamp: { type: Date, default: Date.now },
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'under_review'], default: 'pending' },
  reportId: { type: String, unique: true, required: true },
}, { timestamps: true, collection: 'fire_reports' });

const Report = mongoose.model('Report', ReportSchema);

// Admin Commands
const commands = {
  async pending() {
    console.log('🔍 Fetching pending reports...\n');
    const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 });
    
    if (reports.length === 0) {
      console.log('✅ No pending reports to review');
      return;
    }

    reports.forEach((report, index) => {
      console.log(`📋 Report #${index + 1} (ID: ${report.reportId})`);
      console.log(`   Type: ${report.type} | Severity: ${report.severity}`);
      console.log(`   Location: ${report.coordinates.latitude}, ${report.coordinates.longitude}`);
      console.log(`   Description: ${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}`);
      console.log(`   Submitted: ${report.createdAt.toLocaleString()}`);
      if (report.submissionData.geoLocation) {
        console.log(`   From: ${report.submissionData.geoLocation.city || 'Unknown'}, ${report.submissionData.geoLocation.country || 'Unknown'}`);
      }
      console.log('');
    });

    console.log(`Total pending: ${reports.length} reports`);
  },

  async approve(reportId) {
    if (!reportId) {
      console.log('❌ Usage: node admin.js approve <reportId>');
      return;
    }

    const result = await Report.updateOne(
      { reportId: reportId },
      { status: 'approved' }
    );

    if (result.matchedCount === 0) {
      console.log(`❌ Report ${reportId} not found`);
    } else {
      console.log(`✅ Report ${reportId} approved and is now public`);
    }
  },

  async reject(reportId, reason = 'Not specified') {
    if (!reportId) {
      console.log('❌ Usage: node admin.js reject <reportId> [reason]');
      return;
    }

    const result = await Report.updateOne(
      { reportId: reportId },
      { status: 'rejected', moderationNotes: reason }
    );

    if (result.matchedCount === 0) {
      console.log(`❌ Report ${reportId} not found`);
    } else {
      console.log(`❌ Report ${reportId} rejected. Reason: ${reason}`);
    }
  },

  async stats() {
    console.log('📊 Fire Map Analytics\n');
    
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const approvedReports = await Report.countDocuments({ status: 'approved' });
    const rejectedReports = await Report.countDocuments({ status: 'rejected' });

    console.log(`Total Reports: ${totalReports}`);
    console.log(`├─ Pending: ${pendingReports}`);
    console.log(`├─ Approved: ${approvedReports}`);
    console.log(`└─ Rejected: ${rejectedReports}\n`);

    // Reports by type
    const byType = await Report.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Reports by Type:');
    byType.forEach(item => {
      console.log(`├─ ${item._id}: ${item.count}`);
    });
    console.log('');

    // Reports by severity
    const bySeverity = await Report.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Reports by Severity:');
    bySeverity.forEach(item => {
      console.log(`├─ ${item._id}: ${item.count}`);
    });
    console.log('');

    // Recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: yesterday }
    });

    console.log(`Recent Activity (24h): ${recentReports} new reports`);
  },

  async cleanup(daysOld = 30) {
    console.log(`🧹 Cleaning up reports older than ${daysOld} days...`);
    
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await Report.deleteMany({
      createdAt: { $lt: cutoff },
      status: { $in: ['rejected', 'approved'] } // Only clean up moderated reports
    });

    console.log(`✅ Deleted ${result.deletedCount} old reports`);
  },

  async backup() {
    console.log('💾 Creating backup...');
    const reports = await Report.find({}).sort({ createdAt: -1 });
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `firemap-backup-${timestamp}.json`;
    
    require('fs').writeFileSync(filename, JSON.stringify(reports, null, 2));
    console.log(`✅ Backup saved to ${filename} (${reports.length} reports)`);
  },

  help() {
    console.log(`
🔥 Fire Map Admin Tool

Available Commands:
  pending              List all pending reports awaiting moderation
  approve <reportId>   Approve a report (makes it public)
  reject <reportId>    Reject a report with optional reason
  stats               Show analytics and statistics
  cleanup [days]      Delete old reports (default: 30 days)
  backup              Export all reports to JSON file
  help                Show this help message

Examples:
  node admin.js pending
  node admin.js approve FR_1724728800000_ABC123
  node admin.js reject FR_1724728800000_ABC123 "Spam report"
  node admin.js cleanup 60
  node admin.js stats
    `);
  }
};

// Main execution
async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔥 Connected to MongoDB\n');

    const [,, command, ...args] = process.argv;
    
    if (!command || !commands[command]) {
      commands.help();
      process.exit(0);
    }

    await commands[command](...args);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down admin tool...');
  await mongoose.disconnect();
  process.exit(0);
});

main();
