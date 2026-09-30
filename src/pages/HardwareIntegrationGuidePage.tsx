import {
  Activity,
  Check,
  CheckCircle2,
  Code,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileCode,
  Flame,
  Globe,
  Key,
  Layers,
  Radio,
  Send,
  Shield,
  Terminal,
  Wifi,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { HARDWARE_JSON_SCHEMA } from '../services/hardwareProtocol';

interface HardwareIntegrationGuidePageProps {
  onNavigateToDevices?: () => void;
}

export const HardwareIntegrationGuidePage: React.FC<HardwareIntegrationGuidePageProps> = ({
  onNavigateToDevices,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleJsonRequest = `{
  "deviceId": "ESP32-BIO-01",
  "timestamp": ${Date.now()},
  "sequenceNumber": 1042,
  "accelerometer": {
    "x": 0.14,
    "y": 1.25,
    "z": 9.82
  },
  "gyroscope": {
    "x": 14.2,
    "y": 8.5,
    "z": 4.1
  },
  "heartRate": 82,
  "muscleActivity": 28.5,
  "jointAngle": 15.4,
  "pressure": 7.2,
  "temperature": 36.7
}`;

  const sampleJsonResponse = `{
  "success": true,
  "deviceId": "ESP32-BIO-01",
  "sequenceNumber": 1042,
  "receivedAt": ${Date.now()},
  "latencyMs": 8,
  "bufferSize": 45
}`;

  const sampleCurl = `curl -X POST https://your-server-url/api/sensor-data \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ha_live_esp32_dev" \\
  -d '${sampleJsonRequest.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;

  const sampleArduinoCode = `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-server-url/api/sensor-data";
const char* apiKey    = "ha_live_esp32_dev"; // from Device Registry

int seqNum = 1;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-KEY", apiKey);

    // Read your real physical sensors (e.g. MPU6050, MAX30102, MyoWare EMG)
    StaticJsonDocument<512> doc;
    doc["deviceId"] = "ESP32-BIO-01";
    doc["timestamp"] = (uint64_t)millis();
    doc["sequenceNumber"] = seqNum++;

    JsonObject acc = doc.createNestedObject("accelerometer");
    acc["x"] = 0.14; // replace with mpu.getAccX()
    acc["y"] = 1.25;
    acc["z"] = 9.82;

    JsonObject gyro = doc.createNestedObject("gyroscope");
    gyro["x"] = 14.2; // replace with mpu.getGyroX()
    gyro["y"] = 8.5;
    gyro["z"] = 4.1;

    doc["heartRate"] = 82;         // MAX30102 PPG BPM
    doc["muscleActivity"] = 28.5;  // MyoWare Rectified Envelope %
    doc["jointAngle"] = 15.4;      // Flex sensor or IMU pitch angle
    doc["pressure"] = 7.2;         // FSR Load cell (kg)
    doc["temperature"] = 36.7;     // DS18B20 (°C)

    String payload;
    serializeJson(doc, payload);

    int httpCode = http.POST(payload);
    if (httpCode > 0) {
      Serial.printf("Transmitted Packet #%d -> Response: %d\\n", seqNum - 1, httpCode);
    } else {
      Serial.printf("Transmission Error: %s\\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
  delay(200); // 5 Hz sampling rate
}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 shadow-lg transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Hardware Statement ID 26113 · Firmware Integration Contract</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight mt-1 font-sans">
              Wearable Hardware Integration Guide
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Standard operating protocol for connecting ESP32, nRF52840, STM32, or custom wearable microcontroller prototypes to the HumanAugment AI decision-support platform.
            </p>
          </div>

          {onNavigateToDevices && (
            <button
              onClick={onNavigateToDevices}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40 shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Go to Device Registry</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Expected Sensor Fields */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
              Expected Sensor Fields & Hardware Channels
            </h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">8 Physical Telemetry Channels</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="text-cyan-400 font-bold text-xs">accelerometer (x, y, z)</div>
            <div className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 mt-1 font-sans">
              3-Axis Linear Acceleration in <code className="text-cyan-300">m/s²</code> (nominal 1G vertical gravity is ~9.81 m/s²). Typical range: ±200 m/s².
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="text-cyan-400 font-bold text-xs">gyroscope (x, y, z)</div>
            <div className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 mt-1 font-sans">
              3-Axis Angular Velocity in <code className="text-cyan-300">°/s</code> (Roll, Pitch, Yaw). Used for kinematic jerk detection. Typical range: ±2000 °/s.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="text-rose-400 font-bold text-xs">heartRate</div>
            <div className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 mt-1 font-sans">
              Optical PPG or ECG heart rate in <code className="text-rose-300">BPM</code> (30–240 BPM). Evaluated against Karvonen cardiovascular reserve.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="text-cyan-400 font-bold text-xs">muscleActivity</div>
            <div className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 mt-1 font-sans">
              Surface Electromyography (sEMG) rectified linear envelope in <code className="text-cyan-300">% MVC</code> (Maximum Voluntary Contraction).
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="text-emerald-400 font-bold text-xs">jointAngle</div>
            <div className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 mt-1 font-sans">
              Trunk/spine flexion or elbow/knee angle in <code className="text-emerald-300">degrees</code>. Evaluated against ISO 11226 / REBA standards (0°–20° safe).
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="text-amber-400 font-bold text-xs">pressure & temperature</div>
            <div className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 mt-1 font-sans">
              Handled physical load force in <code className="text-amber-300">kg</code> (0–300 kg) and skin surface temperature in <code className="text-amber-300">°C</code> (15–50°C).
            </div>
          </div>
        </div>
      </div>

      {/* 2. Documented JSON Format */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
              JSON Telemetry Schema Contract
            </h2>
          </div>
          <button
            onClick={() => copyCode(JSON.stringify(HARDWARE_JSON_SCHEMA, null, 2), 'schema')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'schema' ? 'Copied' : 'Copy JSON Schema'}</span>
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-[#090d16] border border-slate-800">
          <pre className="p-4 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
{`{
  "deviceId": "ESP32-BIO-01",
  "timestamp": 1727618000000,
  "sequenceNumber": 1042,
  "accelerometer": {
    "x": 0.14,
    "y": 1.25,
    "z": 9.82
  },
  "gyroscope": {
    "x": 14.2,
    "y": 8.5,
    "z": 4.1
  },
  "heartRate": 82,
  "muscleActivity": 28.5,
  "jointAngle": 15.4,
  "pressure": 7.2,
  "temperature": 36.7
}`}
          </pre>
        </div>
      </div>

      {/* 3 & 4. API Endpoint & Authentication Requirement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Endpoint */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-3 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
              API Ingestion Endpoint
            </h3>
          </div>
          <div className="font-mono text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#111726] border border-slate-800">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">POST</span>
              <span className="text-slate-100 font-bold">/api/sensor-data</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-sans">
            Wearable devices broadcast HTTP POST requests over WiFi, cellular LTE-M, or BLE edge gateways at 5Hz to 50Hz.
          </p>
          <div className="text-[11px] font-mono text-slate-500">
            Real-time SSE stream available at: <code className="text-cyan-400">GET /api/sensor-stream</code>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-3 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">4</span>
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
              Authentication Requirement
            </h3>
          </div>
          <div className="font-mono text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#111726] border border-slate-800">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold text-[10px]">HEADER</span>
              <span className="text-slate-100 font-bold">X-API-KEY: &lt;YOUR_DEVICE_TOKEN&gt;</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-sans">
            Every registered wearable device is issued a cryptographically secure token. Unregistered keys or malformed tokens receive <code className="text-rose-400">401 Unauthorized</code>.
          </p>
          <div className="text-[11px] font-mono text-slate-500">
            Demo token for initial prototyping: <code className="text-cyan-400">ha_live_esp32_dev</code>
          </div>
        </div>
      </div>

      {/* 5 & 6. Example Request & Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">5</span>
              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
                Example cURL Request
              </h3>
            </div>
            <button
              onClick={() => copyCode(sampleCurl, 'curl')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'curl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="bg-[#090d16] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">{sampleCurl}</pre>
          </div>
        </div>

        {/* Response */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">6</span>
              <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
                Example Server Response (200 OK)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">HTTP 200 OK</span>
          </div>
          <div className="bg-[#090d16] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
            <pre className="leading-relaxed">{sampleJsonResponse}</pre>
          </div>
        </div>
      </div>

      {/* 7. ESP32 Arduino C++ Firmware Code Template */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">7</span>
            <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
              Complete ESP32 Arduino C++ Firmware Template
            </h2>
          </div>
          <button
            onClick={() => copyCode(sampleArduinoCode, 'arduino')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {copiedSection === 'arduino' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'arduino' ? 'Copied' : 'Copy Firmware Code'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed font-sans">
          Flash this code directly to your ESP32 board using Arduino IDE, ESP-IDF, or PlatformIO. It handles WiFi connectivity, JSON serialization, monotonic sequence tracking, and HTTP POST transmission to <code className="text-cyan-300">/api/sensor-data</code>.
        </p>

        <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-96">
          <pre className="leading-relaxed">{sampleArduinoCode}</pre>
        </div>
      </div>

      {/* 8. Device Registration Process */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">8</span>
            <h2 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans">
              Device Registration & Pairing Process
            </h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Step-by-Step Onboarding</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center mb-2">1</div>
            <h4 className="font-bold text-white dark:text-white light:text-slate-900">Provision in Registry</h4>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[11px] mt-1 leading-relaxed">
              Navigate to the <strong>ESP32 Hardware</strong> page and click <em>"Register New Wearable"</em>. Enter hardware pod name and communication protocol.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center mb-2">2</div>
            <h4 className="font-bold text-white dark:text-white light:text-slate-900">Copy Ingestion Token</h4>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[11px] mt-1 leading-relaxed">
              Copy the generated <code className="text-cyan-300">ha_live_...</code> API key and flash it into your microcontroller's NVS or flash configuration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center mb-2">3</div>
            <h4 className="font-bold text-white dark:text-white light:text-slate-900">Transmit Packets</h4>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[11px] mt-1 leading-relaxed">
              Microcontroller transmits JSON packets over WiFi with monotonic <code className="text-cyan-300">sequenceNumber</code> and timestamps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center mb-2">4</div>
            <h4 className="font-bold text-white dark:text-white light:text-slate-900">Live Decision Support</h4>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[11px] mt-1 leading-relaxed">
              Platform status switches to <strong>ONLINE</strong>, streaming real-time waveforms, fatigue index, and ISO 11226 posture alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
