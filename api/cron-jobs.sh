#!/bin/bash
# Fire Map Cron Jobs - Database Maintenance
# Add to /etc/cron.d/firemap on your Vultr server

# Backup database daily at 3:05 AM
5 3 * * * root cd /var/www/firemap/api && /usr/bin/node admin.js backup >> /var/log/firemap-backup.log 2>&1

# Clean up old reports weekly on Sunday at 2:30 AM (keep 30 days)
30 2 * * 0 root cd /var/www/firemap/api && /usr/bin/node admin.js cleanup 30 >> /var/log/firemap-cleanup.log 2>&1

# Generate weekly stats report on Monday at 9:00 AM
0 9 * * 1 root cd /var/www/firemap/api && /usr/bin/node admin.js stats >> /var/log/firemap-stats.log 2>&1
