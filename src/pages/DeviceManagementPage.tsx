import {
  BatteryCharging,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  FileCode,
  Key,
  Pause,
  Play,
  Plus,
  Power,
  Radio,
  RefreshCw,
  Send,
  Terminal,
  Trash2,
  Wifi,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { HARDWARE_JSON_SCHEMA, readingToHardwarePayload } from '../services/hardwareProtocol';
import { Device, IngestionLog, SensorReading } from '../types';

interface DeviceManagementPageProps {
  onNavigateToGuide?: () => void;
}

export const DeviceManagementPage: React.FC<DeviceManagementPageProps> = ({ onNavigateToGuide }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SIMULATED' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [newDeviceOpen, setNewDeviceOpen] = useState(false);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>([]);

  // New device form state
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('ESP32 Wearable Biomechanical Rig');
  const [newDevConn, setNewDevConn] = useState<'BLE 5.2' | 'WiFi 802.11 b/g/n' | 'USB-Serial'>('WiFi 802.11 b/g/n');
  const [newDevRate, setNewDevRate] = useState(10);

  useEffect(() => {
    loadDevices();
    loadLogs();
  }, []);

  const loadDevices = async () => {
    const list = await apiClient.getDevices();
    setDevices(list);
  };

  const loadLogs = async () => {
    const logs = await apiClient.getIngestionLogs();
    setIngestionLogs(logs);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleActivate = async (deviceId: string) => {
    await apiClient.activateDevice(deviceId);
    await loadDevices();
  };

  const handleDeactivate = async (deviceId: string) => {
    await apiClient.deactivateDevice(deviceId);
    await loadDevices();
  };

  const handleRemove = async (deviceId: string) => {
    if (confirm(`Unregister device ${deviceId}?`)) {
      await apiClient.removeDevice(deviceId);
      await loadDevices();
    }
  };

  const handleTestHardwareIngestion = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testPayload = {
      deviceId: 'ESP32-BIO-01',
      timestamp: Date.now(),
      sequenceNumber: Math.floor(Math.random() * 9000 + 1000),
      accelerometer: {
        x: 0.14,
        y: 1.25,
        z: 9.82,
      },
      gyroscope: {
        x: 14.2,
        y: 8.5,
        z: 4.1,
      },
      heartRate: 82,
      muscleActivity: 28.5,
      jointAngle: 15.4,
      pressure: 7.2,
      temperature: 36.7,
    };

    const startTime = performance.now();
    try {
      const res = await apiClient.ingestSensorReading(testPayload as any, 'ha_live_esp32_dev');
      const latencyMs = Math.round(performance.now() - startTime);
      setTestResult(
        `SUCCESS: Ingested telemetry packet into POST /api/sensor-data (Sequence #${testPayload.sequenceNumber}, Roundtrip latency: ${latencyMs}ms). Device marked ONLINE.`
      );
      await loadDevices();
      await loadLogs();
    } catch {
      setTestResult('ERROR: Telemetry ingestion failed. Check network connection.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName) return;

    const newDev: Device = {
      deviceId: `ESP32-BIO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      deviceName: newDevName,
      deviceType: newDevType,
      firmwareVersion: 'v1.0.0-esp32',
      status: 'ONLINE',
      lastSeen: Date.now(),
      batteryLevel: 100,
      connectionType: newDevConn,
      sampleRateHz: newDevRate,
      apiKey: `ha_live_${Math.random().toString(36).substring(2, 14)}`,
    };

    await apiClient.saveDevice(newDev);
    await loadDevices();
    setNewDeviceOpen(false);
    setNewDevName('');
  };

  const filteredDevices = devices.filter(d => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 lg:p-6 shadow-lg transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1 font-bold">
              Hardware Gateway & Device Registry
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight font-sans">
              Wearable Device Management & Status
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Register, activate, deactivate, and monitor connected ESP32 wearable sensor pods. Both simulated pods and physical IoT hardware broadcast to the same data contract.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateToGuide && (
              <button
                onClick={onNavigateToGuide}
                className="px-3.5 py-2 bg-[#111726] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Integration Guide</span>
              </button>
            )}
            <button
              onClick={() => setNewDeviceOpen(!newDeviceOpen)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Device</span>
            </button>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status Filter:</span>
            <div className="flex items-center bg-[#111726] dark:bg-[#111726] light:bg-slate-100 p-0.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300">
              {(['ALL', 'ONLINE', 'SIMULATED', 'OFFLINE'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-cyan-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-400">
            {filteredDevices.length} registered hardware {filteredDevices.length === 1 ? 'unit' : 'units'}
          </div>
        </div>
      </div>

      {/* New Device Form Modal / Drawer */}
      {newDeviceOpen && (
        <form
          onSubmit={handleRegisterDevice}
          className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-cyan-500/50 rounded-2xl p-5 space-y-4 text-xs font-mono shadow-2xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
              Register New Wearable Microcontroller Pod
            </h3>
            <span className="text-[10px] text-cyan-400">Auto-Generates Cryptographic Ingestion Key</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Device Name</label>
              <input
                type="text"
                value={newDevName}
                onChange={e => setNewDevName(e.target.value)}
                required
                placeholder="e.g. Lumbar IMU Rig 04"
                className="w-full bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-lg px-2.5 py-2 text-slate-100 dark:text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Device Type</label>
              <input
                type="text"
                value={newDevType}
                onChange={e => setNewDevType(e.target.value)}
                className="w-full bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-lg px-2.5 py-2 text-slate-100 dark:text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Connection Protocol</label>
              <select
                value={newDevConn}
                onChange={e => setNewDevConn(e.target.value as any)}
                className="w-full bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-lg px-2.5 py-2 text-slate-100 dark:text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500 font-sans"
              >
                <option value="WiFi 802.11 b/g/n">WiFi 802.11 b/g/n</option>
                <option value="BLE 5.2">BLE 5.2</option>
                <option value="USB-Serial">USB-Serial</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Target Sampling Rate</label>
              <select
                value={newDevRate}
                onChange={e => setNewDevRate(Number(e.target.value))}
                className="w-full bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-lg px-2.5 py-2 text-slate-100 dark:text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-500 font-sans"
              >
                <option value={5}>5 Hz</option>
                <option value={10}>10 Hz</option>
                <option value={20}>20 Hz</option>
                <option value={50}>50 Hz</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewDeviceOpen(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl font-sans shadow-md"
            >
              Provision & Register Device
            </button>
          </div>
        </form>
      )}

      {/* Devices List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map(dev => (
          <div
            key={dev.deviceId}
            className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-md transition-all hover:border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[11px]">
                <span className="text-slate-400 font-bold">{dev.deviceId}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    dev.status === 'SIMULATED'
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800'
                      : dev.status === 'ONLINE'
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {dev.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 mb-1">{dev.deviceName}</h3>
              <p className="text-xs text-slate-400 mb-4">{dev.deviceType}</p>

              <div className="space-y-2 text-xs font-mono bg-[#111726] dark:bg-[#111726] light:bg-slate-100 rounded-xl p-3 border border-slate-800 dark:border-slate-800 light:border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Firmware:</span>
                  <span className="text-slate-300 dark:text-slate-300 light:text-slate-700">{dev.firmwareVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Connection:</span>
                  <span className="text-cyan-400 font-semibold">{dev.connectionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Battery Level:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>{dev.batteryLevel}%</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Seen:</span>
                  <span className="text-slate-300 dark:text-slate-300 light:text-slate-700">
                    {new Date(dev.lastSeen).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Ingestion Key & Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 font-mono text-[11px] space-y-3">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>API Key Token:</span>
                  <button
                    onClick={() => copyToClipboard(dev.apiKey || dev.deviceId)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === (dev.apiKey || dev.deviceId) ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === (dev.apiKey || dev.deviceId) ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#090d16] dark:bg-[#090d16] light:bg-slate-200 p-1.5 rounded-lg text-slate-300 dark:text-slate-300 light:text-slate-800 truncate text-[10px]">
                  {dev.apiKey || 'ha_live_default_pod'}
                </div>
              </div>

              {/* Action buttons (Activate / Deactivate / Remove) */}
              <div className="flex items-center justify-between pt-1">
                {dev.status === 'ONLINE' ? (
                  <button
                    onClick={() => handleDeactivate(dev.deviceId)}
                    className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/70 text-amber-300 rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <Power className="w-3 h-3" />
                    <span>Deactivate</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(dev.deviceId)}
                    className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                  >
                    <Power className="w-3 h-3" />
                    <span>Activate</span>
                  </button>
                )}

                {dev.status !== 'SIMULATED' && (
                  <button
                    onClick={() => handleRemove(dev.deviceId)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                    title="Remove device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hardware Bridge Test Bench */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 lg:p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider font-mono">
              ESP32 / Wearable Microcontroller Test Bench
            </h3>
          </div>
          <button
            onClick={handleTestHardwareIngestion}
            disabled={isTesting}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-cyan-950/40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isTesting ? 'Transmitting Ingestion...' : 'Transmit Test JSON Packet'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-sans">
          Simulates an incoming HTTP POST from an external microcontroller over the local network or cellular gateway to test endpoint responsiveness, field validation, rate limiting, and Server-Sent Events broadcast.
        </p>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl font-mono text-xs ${
              testResult.startsWith('SUCCESS')
                ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-800 text-rose-300'
            }`}
          >
            {testResult}
          </div>
        )}

        {/* Ingestion Audit Trail */}
        {ingestionLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/70 dark:border-slate-800/70 light:border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold uppercase text-[10px]">Recent Ingestion Audit Trail ({ingestionLogs.length} events)</span>
              <button onClick={loadLogs} className="hover:text-cyan-400 text-[11px] flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {ingestionLogs.slice(0, 8).map(log => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between gap-3 text-slate-300 dark:text-slate-300 light:text-slate-800"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        log.status === 200 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-cyan-400">{log.deviceId}</span>
                    <span className="text-slate-500">#{log.sequenceNumber}</span>
                    <span className="truncate">{log.payloadSummary}</span>
                  </div>
                  <div className="shrink-0 text-[10px] text-slate-500">
                    <span>{log.latencyMs}ms</span> · <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
