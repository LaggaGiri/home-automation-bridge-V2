const express = require("express");
const mqtt = require("mqtt");

const app = express();

// ========================================
// Express Configuration
// ========================================

app.use(express.json());

const PORT = process.env.PORT || 3000;

// ========================================
// HiveMQ Configuration
// ========================================

const MQTT_HOST =
  "mqtts://bd677f2b30e04a8386c8e8295200a313.s1.eu.hivemq.cloud:8883";

const MQTT_USERNAME =
  process.env.hivemq.webclient.1790180434286;

const MQTT_PASSWORD =
  process.env.HF#QA#&AKgVC5uBPFdc3hoZV2lwgwfZG;

// ========================================
// MQTT Topic
// ========================================

const MQTT_TOPIC =
  "esp32/ESP001/test";

// ========================================
// Validate Environment Variables
// ========================================

if (!MQTT_USERNAME) {
  console.error("ERROR: MQTT_USERNAME is not configured.");
}

if (!MQTT_PASSWORD) {
  console.error("ERROR: MQTT_PASSWORD is not configured.");
}

// ========================================
// Connect to HiveMQ
// ========================================

const mqttClient = mqtt.connect(MQTT_HOST, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  protocol: "mqtts",
  port: 8883,
  reconnectPeriod: 5000
});

// ========================================
// MQTT Connected
// ========================================

mqttClient.on("connect", () => {

  console.log("=================================");
  console.log("Connected to HiveMQ");
  console.log("=================================");

  console.log("MQTT Host:");
  console.log(MQTT_HOST);

  console.log("MQTT Topic:");
  console.log(MQTT_TOPIC);

});

// ========================================
// MQTT Error
// ========================================

mqttClient.on("error", (error) => {

  console.error("MQTT Error:");
  console.error(error.message);

});

// ========================================
// MQTT Reconnecting
// ========================================

mqttClient.on("reconnect", () => {

  console.log("Reconnecting to HiveMQ...");

});

// ========================================
// MQTT Offline
// ========================================

mqttClient.on("offline", () => {

  console.log("MQTT Client is offline.");

});

// ========================================
// Health Check
// ========================================

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    service: "ESP32 MQTT Bridge",
    status: "running",
    mqttConnected: mqttClient.connected
  });

});

// ========================================
// MQTT Status
// ========================================

app.get("/mqtt-status", (req, res) => {

  res.status(200).json({
    success: true,
    mqttConnected: mqttClient.connected,
    topic: MQTT_TOPIC
  });

});

// ========================================
// POST /message
// ========================================

app.post("/message", (req, res) => {

  console.log();
  console.log("=================================");
  console.log("HTTP POST REQUEST RECEIVED");
  console.log("=================================");

  console.log("Request Body:");
  console.log(req.body);

  // ----------------------------------------
  // Check MQTT Connection
  // ----------------------------------------

  if (!mqttClient.connected) {

    console.error("MQTT is not connected.");

    return res.status(503).json({
      success: false,
      error: "MQTT broker is not connected"
    });
  }

  // ----------------------------------------
  // Get Message
  // ----------------------------------------

  const message = req.body.message;

  if (!message) {

    return res.status(400).json({
      success: false,
      error: "message is required"
    });
  }

  // ----------------------------------------
  // Convert Message to String
  // ----------------------------------------

  const mqttMessage =
    typeof message === "string"
      ? message
      : JSON.stringify(message);

  // ----------------------------------------
  // Publish MQTT Message
  // ----------------------------------------

  mqttClient.publish(
    MQTT_TOPIC,
    mqttMessage,
    {
      qos: 0,
      retain: false
    },
    (error) => {

      if (error) {

        console.error(
          "MQTT Publish Error:",
          error.message
        );

        return res.status(500).json({
          success: false,
          error: "Failed to publish MQTT message"
        });
      }

      console.log();
      console.log("MQTT MESSAGE PUBLISHED");
      console.log("---------------------------------");
      console.log("Topic:", MQTT_TOPIC);
      console.log("Message:", mqttMessage);
      console.log("---------------------------------");

      return res.status(200).json({
        success: true,
        topic: MQTT_TOPIC,
        message: mqttMessage
      });

    }
  );

});

// ========================================
// 404 Handler
// ========================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });

});

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {

  console.log();
  console.log("=================================");
  console.log("ESP32 MQTT BRIDGE");
  console.log("=================================");
  console.log(`Server running on port ${PORT}`);
  console.log("=================================");

});
