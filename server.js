const express = require("express");
const mqtt = require("mqtt");

const app = express();

app.use(express.json());

// ========================================
// Configuration
// ========================================

const PORT = process.env.PORT || 3000;

const MQTT_HOST =
  "mqtts://bd677f2b30e04a8386c8e8295200a313.s1.eu.hivemq.cloud:8883";

const MQTT_USERNAME =
  process.env.hivemq.webclient.1790180434286;

const MQTT_PASSWORD =
  process.env.HF#QA#&AKgVC5uBPFdc3hoZV2lwgwfZG;

const MQTT_TOPIC =
  "esp32/ESP001/test";

// ========================================
// MQTT Connection
// ========================================

const mqttClient = mqtt.connect(MQTT_HOST, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD
});

mqttClient.on("connect", () => {

  console.log("Connected to HiveMQ");

});

mqttClient.on("error", (error) => {

  console.error("MQTT Error:", error);

});

// ========================================
// Health Check
// ========================================

app.get("/", (req, res) => {

  res.json({
    status: "running",
    service: "ESP32 MQTT Bridge"
  });

});

// ========================================
// POST /message
// ========================================

app.post("/message", (req, res) => {

  console.log("HTTP Request Received");

  console.log("Body:", req.body);

  const message = req.body.message;

  if (!message) {

    return res.status(400).json({
      success: false,
      error: "message is required"
    });

  }

  mqttClient.publish(
    MQTT_TOPIC,
    message,
    (error) => {

      if (error) {

        console.error(
          "MQTT Publish Error:",
          error
        );

        return res.status(500).json({
          success: false,
          error: "Failed to publish MQTT message"
        });

      }

      console.log(
        `MQTT Published: ${message}`
      );

      res.json({
        success: true,
        topic: MQTT_TOPIC,
        message: message
      });

    }
  );

});

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
