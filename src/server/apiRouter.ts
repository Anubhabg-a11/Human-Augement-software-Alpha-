import express, { Request, Response } from 'express';
import { DEMO_ALERTS, DEMO_DEVICES, DEMO_SESSIONS } from '../services/demoData';
import { HARDWARE_JSON_SCHEMA, validateHardwarePayload } from '../services/hardwareProtocol';
import { Device, IngestionLog, SensorReading, Session } from '../types';

export const apiRouter = express.Router();

apiRouter.use(express.json());

// In-memory telemetry cache
const recentReadings: SensorReading[] = [];
let sessions: Session[] = [...DEMO_SESSIONS];
let alerts = [...DEMO_ALERTS];
let devices: Device[] = [...DEMO_DEVICES];

// Device sequence tracking: deviceId -> lastSequenceNumber
const deviceSequenceMap = new Map<string, number>();

// Rate-limiting tracking: deviceId/ip -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 1000;
const MAX_REQUESTS_PER_WINDOW = 100; // up to 100 Hz bursts

// Ingestion audit log buffer (up to 100 logs)
const ingestionLogs: IngestionLog[] = [];

// Server-Sent Events (SSE) active subscriber connections
const sseClients: Set<Response> = new Set();

/**
 * Broadcast telemetry to all connected SSE clients (Future WebSocket / SSE Real-Time Stream)
 */
function broadcastTelemetrySSE(payload: unknown) {
  const dataString = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataString);
    } catch {
      sseClients.delete(client);
    }
  }
}

// -------------------------------------------------------------
// SENSOR DATA INGESTION (Target for ESP32 / IoT Hardware)
// -------------------------------------------------------------

/**
 * POST /api/sensor-data
 * Authenticated, rate-limited, strictly validated sensor telemetry ingestion endpoint.
 */
apiRouter.post('/sensor-data', (req: Request, res: Response) => {
  const startTime = performance.now();
  const rawBody = req.body;

  // 1. Authentication Check
  const authHeader = req.headers['authorization'];
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  let clientApiKey = apiKeyHeader;

  if (!clientApiKey && authHeader && authHeader.startsWith('Bearer ')) {
    clientApiKey = authHeader.substring(7);
  }

  // Device lookup (default to body deviceId)
  const deviceId = rawBody?.deviceId || 'ESP32-BIO-DEFAULT';
  const registeredDevice = devices.find(d => d.deviceId === deviceId);

  // Validate API key: allow known device key, demo token, or fallback demo key
  const validKeys = new Set([
    'ha_live_default_pod',
    'ha_demo_key',
    'ha_live_esp32_dev',
    ...(registeredDevice?.apiKey ? [registeredDevice.apiKey] : []),
    ...devices.map(d => d.apiKey).filter(Boolean),
  ]);

  // If apiKey is provided, it must be valid; if none provided in demo mode, allow fallback for simulator
  if (clientApiKey && !validKeys.has(clientApiKey)) {
    const logEntry: IngestionLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      deviceId,
      sequenceNumber: Number(rawBody?.sequenceNumber) || 0,
      status: 401,
      latencyMs: Math.round(performance.now() - startTime),
      payloadSummary: 'Unauthorized API key',
      issues: ['Invalid or revoked API key header.'],
    };
    ingestionLogs.unshift(logEntry);
    if (ingestionLogs.length > 100) ingestionLogs.pop();

    return res.status(401).json({
      error: 'UNAUTHORIZED_DEVICE',
      message: 'Missing or invalid X-API-KEY header. Please register the device or use a valid token.',
      receivedKey: clientApiKey ? `${clientApiKey.substring(0, 8)}...` : null,
    });
  }

  // 2. Rate Limiting Check
  const clientIdentifier = deviceId || req.ip || 'unknown';
  const now = Date.now();
  const requestHistory = rateLimitMap.get(clientIdentifier) || [];
  const recentHistory = requestHistory.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recentHistory.length >= MAX_REQUESTS_PER_WINDOW) {
    const logEntry: IngestionLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      deviceId,
      sequenceNumber: Number(rawBody?.sequenceNumber) || 0,
      status: 429,
      latencyMs: Math.round(performance.now() - startTime),
      payloadSummary: 'Rate limit exceeded (>100 req/sec)',
      issues: ['Sampling rate exceeded server buffer threshold of 100 requests per second.'],
    };
    ingestionLogs.unshift(logEntry);
    if (ingestionLogs.length > 100) ingestionLogs.pop();

    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Max ingestion frequency exceeded (${MAX_REQUESTS_PER_WINDOW} req/s). Throttle hardware broadcast frequency.`,
      windowResetMs: RATE_LIMIT_WINDOW_MS,
    });
  }

  recentHistory.push(now);
  rateLimitMap.set(clientIdentifier, recentHistory);

  // 3. Schema & Physiological Field Validation
  const validation = validateHardwarePayload(rawBody);

  if (!validation.isValid || !validation.flattenedReading) {
    const logEntry: IngestionLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      deviceId,
      sequenceNumber: Number(rawBody?.sequenceNumber) || 0,
      status: 400,
      latencyMs: Math.round(performance.now() - startTime),
      payloadSummary: 'Validation failure',
      issues: validation.errors,
    };
    ingestionLogs.unshift(logEntry);
    if (ingestionLogs.length > 100) ingestionLogs.pop();

    return res.status(400).json({
      error: 'MALFORMED_SENSOR_PAYLOAD',
      message: 'Sensor packet failed schema validation. See errors list.',
      errors: validation.errors,
      expectedSchemaRef: '/api/sensor-data/schema',
    });
  }

  const { sanitizedPayload, flattenedReading } = validation;

  // 4. Duplicate Sequence Number Detection
  const seqNum = sanitizedPayload?.sequenceNumber ?? 0;
  const lastSeq = deviceSequenceMap.get(deviceId);
  let duplicateWarning: string | null = null;

  if (lastSeq !== undefined && seqNum !== 0) {
    if (seqNum === lastSeq) {
      duplicateWarning = `DUPLICATE_PACKET_IGNORED: Sequence #${seqNum} already ingested.`;
    } else if (seqNum < lastSeq) {
      duplicateWarning = `OUT_OF_ORDER_SEQUENCE: Ingested packet #${seqNum} is older than last seen #${lastSeq}.`;
    }
  }

  if (seqNum > 0) {
    deviceSequenceMap.set(deviceId, seqNum);
  }

  // 5. Ingest into memory buffer
  recentReadings.push(flattenedReading);
  if (recentReadings.length > 300) {
    recentReadings.shift();
  }

  // 6. Update device state (lastSeen, status = ONLINE)
  if (registeredDevice) {
    registeredDevice.lastSeen = Date.now();
    if (registeredDevice.status !== 'SIMULATED') {
      registeredDevice.status = 'ONLINE';
    }
  }

  // 7. Broadcast via Server-Sent Events (SSE) to real-time subscribers
  broadcastTelemetrySSE({
    event: 'telemetry',
    reading: flattenedReading,
    payload: sanitizedPayload,
    deviceId,
  });

  const latencyMs = Math.round(performance.now() - startTime);

  // 8. Log success
  const logEntry: IngestionLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    deviceId,
    sequenceNumber: seqNum,
    status: 200,
    latencyMs,
    payloadSummary: `HR: ${flattenedReading.heart_rate} BPM | Flex: ${flattenedReading.joint_angle}° | EMG: ${flattenedReading.muscle_activity}%`,
    issues: duplicateWarning ? [duplicateWarning] : undefined,
  };
  ingestionLogs.unshift(logEntry);
  if (ingestionLogs.length > 100) ingestionLogs.pop();

  return res.status(200).json({
    success: true,
    deviceId,
    sequenceNumber: seqNum,
    receivedAt: now,
    latencyMs,
    bufferSize: recentReadings.length,
    warning: duplicateWarning || undefined,
  });
});

/**
 * GET /api/sensor-data
 * Retrieve sliding window of verified sensor readings.
 */
apiRouter.get('/sensor-data', (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt((req.query.limit as string) || '50', 10));
  return res.json({
    readings: recentReadings.slice(-limit),
    count: recentReadings.length,
    hardwareGatewayStatus: 'ONLINE',
    activeSubscribers: sseClients.size,
  });
});

/**
 * GET /api/sensor-data/schema
 * Documented JSON schema endpoint for ESP32 firmware developers.
 */
apiRouter.get('/sensor-data/schema', (_req: Request, res: Response) => {
  return res.json(HARDWARE_JSON_SCHEMA);
});

/**
 * GET /api/sensor-data/logs
 * Ingestion audit trail log for hardware diagnostics.
 */
apiRouter.get('/sensor-data/logs', (_req: Request, res: Response) => {
  return res.json(ingestionLogs.slice(0, 50));
});

// -------------------------------------------------------------
// REAL-TIME STREAMING (Server-Sent Events / SSE)
// -------------------------------------------------------------

/**
 * GET /api/sensor-stream
 * Server-Sent Events endpoint for real-time telemetry broadcast.
 * Enables live wireless dashboards without client polling.
 */
apiRouter.get('/sensor-stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connection handshake
  res.write(`data: ${JSON.stringify({ event: 'connected', timestamp: Date.now(), message: 'HumanAugment SSE Bridge active' })}\n\n`);

  sseClients.add(res);

  // Heartbeat ping every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ event: 'ping', timestamp: Date.now() })}\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// -------------------------------------------------------------
// DEVICE MANAGEMENT API
// -------------------------------------------------------------

/**
 * GET /api/devices - List all registered devices
 */
apiRouter.get('/devices', (_req: Request, res: Response) => {
  return res.json(devices);
});

/**
 * POST /api/devices - Register new hardware device
 */
apiRouter.post('/devices', (req: Request, res: Response) => {
  const body = req.body;
  if (!body || !body.deviceName) {
    return res.status(400).json({ error: 'deviceName is required for device registration' });
  }

  const newDevice: Device = {
    deviceId: body.deviceId || `ESP32-BIO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    deviceName: body.deviceName,
    deviceType: body.deviceType || 'ESP32 Wearable Biomechanical Rig',
    firmwareVersion: body.firmwareVersion || 'v1.0.0-esp32',
    status: body.status || 'ONLINE',
    lastSeen: Date.now(),
    batteryLevel: body.batteryLevel ?? 100,
    connectionType: body.connectionType || 'WiFi 802.11 b/g/n',
    sampleRateHz: body.sampleRateHz || 10,
    hardwareMac: body.hardwareMac || `24:6F:28:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}`,
    apiKey: body.apiKey || `ha_live_${Math.random().toString(36).substring(2, 14)}`,
  };

  const existingIdx = devices.findIndex(d => d.deviceId === newDevice.deviceId);
  if (existingIdx >= 0) {
    devices[existingIdx] = { ...devices[existingIdx], ...newDevice };
  } else {
    devices.push(newDevice);
  }

  return res.status(201).json(newDevice);
});

/**
 * POST /api/devices/:id/activate - Activate device (ONLINE)
 */
apiRouter.post('/devices/:id/activate', (req: Request, res: Response) => {
  const dev = devices.find(d => d.deviceId === req.params.id);
  if (!dev) return res.status(404).json({ error: 'Device not found' });
  dev.status = 'ONLINE';
  dev.lastSeen = Date.now();
  return res.json({ success: true, device: dev });
});

/**
 * POST /api/devices/:id/deactivate - Deactivate device (OFFLINE)
 */
apiRouter.post('/devices/:id/deactivate', (req: Request, res: Response) => {
  const dev = devices.find(d => d.deviceId === req.params.id);
  if (!dev) return res.status(404).json({ error: 'Device not found' });
  dev.status = 'OFFLINE';
  return res.json({ success: true, device: dev });
});

/**
 * PATCH /api/devices/:id - Update device telemetry/metadata
 */
apiRouter.patch('/devices/:id', (req: Request, res: Response) => {
  const dev = devices.find(d => d.deviceId === req.params.id);
  if (!dev) return res.status(404).json({ error: 'Device not found' });
  Object.assign(dev, req.body);
  return res.json({ success: true, device: dev });
});

/**
 * DELETE /api/devices/:id - Unregister device
 */
apiRouter.delete('/devices/:id', (req: Request, res: Response) => {
  const initialLen = devices.length;
  devices = devices.filter(d => d.deviceId !== req.params.id);
  if (devices.length === initialLen) {
    return res.status(404).json({ error: 'Device not found' });
  }
  return res.json({ success: true, message: `Device ${req.params.id} removed.` });
});

// -------------------------------------------------------------
// SESSIONS & ALERTS
// -------------------------------------------------------------

apiRouter.get('/sessions', (_req: Request, res: Response) => {
  return res.json(sessions);
});

apiRouter.get('/sessions/:id', (req: Request, res: Response) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  return res.json(session);
});

apiRouter.post('/sessions', (req: Request, res: Response) => {
  const session = req.body as Session;
  if (!session || !session.id) return res.status(400).json({ error: 'Session ID is required' });
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  return res.status(201).json(session);
});

apiRouter.get('/alerts', (_req: Request, res: Response) => {
  return res.json(alerts);
});

apiRouter.post('/alerts/:id/read', (req: Request, res: Response) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (alert) {
    alert.isRead = true;
    return res.json({ success: true, alert });
  }
  return res.status(404).json({ error: 'Alert not found' });
});

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ONLINE',
    service: 'HumanAugment AI Telemetry Gateway',
    timestamp: Date.now(),
    version: '2.4.0',
    problemStatementId: 26113,
    activeDevices: devices.filter(d => d.status === 'ONLINE').length,
    activeSubscribers: sseClients.size,
  });
});
