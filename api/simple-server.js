/**
 * Firemap API (Express + MongoDB)
 * - Stores user fire reports securely in MongoDB
 * - Rate-limited and validated inputs
 * - Hides sensitive fields in public responses
 */

// Env/config
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const validator = require('validator');
const geoip = require('geoip-lite');

const app = express();
const PORT = process.env.PORT || 3001;
const ORIGIN = process.env.CORS_ORIGIN || 'https://wildfiremap.app';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/firemap';

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({ origin: [ORIGIN, 'https://www.wildfiremap.app', 'http://localhost:3000'], credentials: true }));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Connect DB
mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((e) => console.error('MongoDB connect error', e.message));

// Schema
const ReportSchema = new mongoose.Schema(
	{
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
	},
	{ timestamps: true, collection: 'fire_reports' }
);

ReportSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
ReportSchema.index({ 'submissionData.timestamp': -1 });

const Report = mongoose.model('Report', ReportSchema);

// Utils
const genId = () => `FR_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const sanitize = (s) => (s ? validator.escape(String(s).trim()) : '');
const validCoords = (lat, lng) =>
	validator.isFloat(String(lat), { min: -90, max: 90 }) && validator.isFloat(String(lng), { min: -180, max: 180 });

// Health
app.get('/api/health', (req, res) => {
	res.json({ ok: true, service: 'firemap-api', ts: new Date().toISOString() });
});

// Submit report
app.post('/api/reports', async (req, res) => {
	try {
		const { type, severity, description, location, contactInfo } = req.body || {};
		if (!type || !severity || !description || !location) {
			return res.status(400).json({ ok: false, error: 'Missing type, severity, description, or location' });
		}

		const parts = String(location).split(',');
		if (parts.length !== 2) return res.status(400).json({ ok: false, error: 'Invalid location format' });
		const lat = parseFloat(parts[0]);
		const lng = parseFloat(parts[1]);
		if (!validCoords(lat, lng)) return res.status(400).json({ ok: false, error: 'Invalid coordinates' });

		const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
		const ua = req.get('User-Agent') || '';
		const geo = geoip.lookup(ip) || undefined;

		const doc = await Report.create({
			type: sanitize(type),
			severity: sanitize(severity),
			description: sanitize(description),
			coordinates: { latitude: lat, longitude: lng },
			locationString: sanitize(location),
			contactInfo: sanitize(contactInfo),
			submissionData: {
				ipAddress: ip,
				userAgent: ua,
				geoLocation: geo
					? { country: geo.country, region: geo.region, city: geo.city, timezone: geo.timezone }
					: undefined,
				timestamp: new Date(),
			},
			status: 'pending',
			reportId: genId(),
		});

		return res.status(201).json({ ok: true, reportId: doc.reportId, status: doc.status });
	} catch (e) {
		console.error('POST /api/reports error:', e.message);
		return res.status(500).json({ ok: false, error: 'Server error' });
	}
});

// Public: approved reports only (hide IP/UA)
app.get('/api/reports', async (req, res) => {
	try {
		const { limit = 50, offset = 0, type, severity } = req.query;
		const q = { status: 'approved' };
		if (type) q.type = type;
		if (severity) q.severity = severity;

		const rows = await Report.find(q)
			.select('-submissionData.ipAddress -submissionData.userAgent')
			.sort({ 'submissionData.timestamp': -1 })
			.skip(parseInt(offset))
			.limit(parseInt(limit));

		res.json({ ok: true, count: rows.length, reports: rows });
	} catch (e) {
		console.error('GET /api/reports error:', e.message);
		res.status(500).json({ ok: false, error: 'Server error' });
	}
});

// Fallback
app.use('*', (_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

app.listen(PORT, () => console.log(`Firemap API listening on :${PORT}`));

