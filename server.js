const express = require("express");
const mqtt = require("mqtt");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// HiveMQ Cloud Details
const client = mqtt.connect(
  "mqtts://bd677f2b30e04a8386c8e8295200a313.s1.eu.hivemq.cloud:8883",
  {
    username: "Giri@home.com",
    password: "AMMAnanna@9550"
  }
);

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud");
});

client.on("error", (err) => {
  console.log("MQTT Error:", err);
});

app.get("/", (req, res) => {
  res.send("Home Automation Bridge Running");
});

app.post("/relay", (req, res) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== "GIRI123456") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const espCode = req.body.espCode;
  const relay = Number(req.body.relay);
  const state = String(req.body.state).toUpperCase();

  if (!espCode || relay < 1 || relay > 8 || !["ON", "OFF"].includes(state)) {
    return res.status(400).json({
      success: false,
      message: "Invalid espCode, relay, or state"
    });
  }

  const topic = `home/${espCode}/relay${relay}`;

  // ESP32 code expects plain "ON" or "OFF"
  client.publish(topic, state);

  res.json({
    success: true,
    topic: topic,
    state: state
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
