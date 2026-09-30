import {
  Alert,
  Device,
  HardwareSensorPayload,
  IngestionLog,
  ProcessedMetrics,
  SensorReading,
  Session,
  UserProfile,
} from '../types';
import { DEMO_ALERTS, DEMO_DEVICES, DEMO_SESSIONS, DEMO_USER } from './demoData';
import { HARDWARE_JSON_SCHEMA, readingToHardwarePayload } from './hardwareProtocol';

/**
 * Hardware-Ready API Client
 *
 * Implements the REST and Streaming API endpoints for ESP32 / Wearable IoT Hardware.
 * Capable of communicating with backend `/api/*` endpoints and maintaining local state
 * fallback with persistent browser storage.
 */
class ApiClient {
  private storageKeyPrefix = 'ha_storage_';
  private readingsMemoryBuffer: SensorReading[] = [];
  private maxBufferLength = 300;
  private activeSequenceNumber = 1000;

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(`${this.storageKeyPrefix}devices`)) {
      localStorage.setItem(`${this.storageKeyPrefix}devices`, JSON.stringify(DEMO_DEVICES));
    }
    if (!localStorage.getItem(`${this.storageKeyPrefix}sessions`)) {
      localStorage.setItem(`${this.storageKeyPrefix}sessions`, JSON.stringify(DEMO_SESSIONS));
    }
    if (!localStorage.getItem(`${this.storageKeyPrefix}alerts`)) {
      localStorage.setItem(`${this.storageKeyPrefix}alerts`, JSON.stringify(DEMO_ALERTS));
    }
    if (!localStorage.getItem(`${this.storageKeyPrefix}user`)) {
      localStorage.setItem(`${this.storageKeyPrefix}user`, JSON.stringify(DEMO_USER));
    }
  }

  // SENSOR DATA INGESTION (Target for ESP32 / IoT Hardware)
  public async ingestSensorReading(
    reading: SensorReading | HardwareSensorPayload,
    apiKey: string = 'ha_live_default_pod'
  ): Promise<{ success: boolean; receivedAt: number; latencyMs?: number; warning?: string }> {
    // Increment sequence number
    this.activeSequenceNumber++;

    // Format reading
    let flatReading: SensorReading;
    let hardwarePayload: HardwareSensorPayload;

    if ('accelerometer' in reading && typeof reading.accelerometer === 'object') {
      hardwarePayload = reading as HardwareSensorPayload;
      flatReading = {
        timestamp: hardwarePayload.timestamp,
        acc_x: hardwarePayload.accelerometer.x,
        acc_y: hardwarePayload.accelerometer.y,
        acc_z: hardwarePayload.accelerometer.z,
        gyro_x: hardwarePayload.gyroscope.x,
        gyro_y: hardwarePayload.gyroscope.y,
        gyro_z: hardwarePayload.gyroscope.z,
        heart_rate: hardwarePayload.heartRate,
        muscle_activity: hardwarePayload.muscleActivity,
        joint_angle: hardwarePayload.jointAngle,
        pressure: hardwarePayload.pressure,
        temperature: hardwarePayload.temperature,
      };
    } else {
      flatReading = reading as SensorReading;
      hardwarePayload = readingToHardwarePayload(flatReading, 'ESP32-BIO-01', this.activeSequenceNumber);
    }

    this.readingsMemoryBuffer.push(flatReading);
    if (this.readingsMemoryBuffer.length > this.maxBufferLength) {
      this.readingsMemoryBuffer.shift();
    }

    try {
      // Broadcast via official POST /api/sensor-data endpoint
      const response = await fetch('/api/sensor-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(hardwarePayload),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // In offline / client-only mode, gracefully process
    }

    return { success: true, receivedAt: Date.now() };
  }

  public getRecentReadings(count: number = 50): SensorReading[] {
    return this.readingsMemoryBuffer.slice(-count);
  }

  /**
   * Connects to Server-Sent Events stream for live real-time telemetry
   */
  public connectTelemetryStream(onData: (reading: SensorReading) => void): () => void {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return () => {};
    }

    try {
      const eventSource = new EventSource('/api/sensor-stream');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'telemetry' && parsed.reading) {
            onData(parsed.reading);
          }
        } catch {
          // ignore non-json pings
        }
      };

      return () => {
        eventSource.close();
      };
    } catch {
      return () => {};
    }
  }

  // SESSIONS API
  public async getSessions(): Promise<Session[]> {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) return await res.json();
    } catch {
      // fallback to persistent local storage
    }
    const raw = localStorage.getItem(`${this.storageKeyPrefix}sessions`);
    return raw ? JSON.parse(raw) : DEMO_SESSIONS;
  }

  public async getSessionById(id: string): Promise<Session | null> {
    const sessions = await this.getSessions();
    return sessions.find(s => s.id === id) || null;
  }

  public async saveSession(session: Session): Promise<Session> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    let updated: Session[];
    if (index >= 0) {
      updated = [...sessions];
      updated[index] = session;
    } else {
      updated = [session, ...sessions];
    }
    localStorage.setItem(`${this.storageKeyPrefix}sessions`, JSON.stringify(updated));

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
    } catch {
      // offline fallback
    }

    return session;
  }

  // ALERTS API
  public async getAlerts(): Promise<Alert[]> {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const raw = localStorage.getItem(`${this.storageKeyPrefix}alerts`);
    return raw ? JSON.parse(raw) : DEMO_ALERTS;
  }

  public async markAlertAsRead(alertId: string): Promise<void> {
    const alerts = await this.getAlerts();
    const updated = alerts.map(a => (a.id === alertId ? { ...a, isRead: true } : a));
    localStorage.setItem(`${this.storageKeyPrefix}alerts`, JSON.stringify(updated));

    try {
      await fetch(`/api/alerts/${alertId}/read`, { method: 'POST' });
    } catch {
      // offline fallback
    }
  }

  public async addAlert(alert: Alert): Promise<Alert> {
    const alerts = await this.getAlerts();
    const updated = [alert, ...alerts];
    localStorage.setItem(`${this.storageKeyPrefix}alerts`, JSON.stringify(updated));
    return alert;
  }

  public async clearAllAlerts(): Promise<void> {
    localStorage.setItem(`${this.storageKeyPrefix}alerts`, JSON.stringify([]));
  }

  // DEVICES API
  public async getDevices(): Promise<Device[]> {
    try {
      const res = await fetch('/api/devices');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const raw = localStorage.getItem(`${this.storageKeyPrefix}devices`);
    return raw ? JSON.parse(raw) : DEMO_DEVICES;
  }

  public async saveDevice(device: Device): Promise<Device> {
    const devices = await this.getDevices();
    const index = devices.findIndex(d => d.deviceId === device.deviceId);
    let updated: Device[];
    if (index >= 0) {
      updated = [...devices];
      updated[index] = device;
    } else {
      updated = [...devices, device];
    }
    localStorage.setItem(`${this.storageKeyPrefix}devices`, JSON.stringify(updated));

    try {
      await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device),
      });
    } catch {
      // offline fallback
    }
    return device;
  }

  public async activateDevice(deviceId: string): Promise<Device | null> {
    const devices = await this.getDevices();
    const dev = devices.find(d => d.deviceId === deviceId);
    if (!dev) return null;
    dev.status = 'ONLINE';
    dev.lastSeen = Date.now();
    await this.saveDevice(dev);
    try {
      await fetch(`/api/devices/${deviceId}/activate`, { method: 'POST' });
    } catch {}
    return dev;
  }

  public async deactivateDevice(deviceId: string): Promise<Device | null> {
    const devices = await this.getDevices();
    const dev = devices.find(d => d.deviceId === deviceId);
    if (!dev) return null;
    dev.status = 'OFFLINE';
    await this.saveDevice(dev);
    try {
      await fetch(`/api/devices/${deviceId}/deactivate`, { method: 'POST' });
    } catch {}
    return dev;
  }

  public async removeDevice(deviceId: string): Promise<boolean> {
    const devices = await this.getDevices();
    const updated = devices.filter(d => d.deviceId !== deviceId);
    localStorage.setItem(`${this.storageKeyPrefix}devices`, JSON.stringify(updated));
    try {
      await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
    } catch {}
    return true;
  }

  public async getIngestionLogs(): Promise<IngestionLog[]> {
    try {
      const res = await fetch('/api/sensor-data/logs');
      if (res.ok) return await res.json();
    } catch {}
    return [];
  }

  public getHardwareSchema() {
    return HARDWARE_JSON_SCHEMA;
  }

  // USER PROFILE
  public async getUserProfile(): Promise<UserProfile> {
    const raw = localStorage.getItem(`${this.storageKeyPrefix}user`);
    return raw ? JSON.parse(raw) : DEMO_USER;
  }

  public async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(`${this.storageKeyPrefix}user`, JSON.stringify(updated));
    return updated;
  }

  // RESET TO DEMO DATA
  public resetDemoData(): void {
    localStorage.setItem(`${this.storageKeyPrefix}devices`, JSON.stringify(DEMO_DEVICES));
    localStorage.setItem(`${this.storageKeyPrefix}sessions`, JSON.stringify(DEMO_SESSIONS));
    localStorage.setItem(`${this.storageKeyPrefix}alerts`, JSON.stringify(DEMO_ALERTS));
    localStorage.setItem(`${this.storageKeyPrefix}user`, JSON.stringify(DEMO_USER));
  }
}

export const apiClient = new ApiClient();
