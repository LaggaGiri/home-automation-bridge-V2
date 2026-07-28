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
  console.log(err);
});

app.get("/", (req, res) => {
  res.send("Home Automation Bridge Running");
});
app.post("/relay", (req, res) => {

  // API Key Validation
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== "GIRI123456") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const room = req.body.room;
  const relay = req.body.relay;
  const state = req.body.state;

  const topic = `home/${room}/relay${relay}`;

  client.publish(topic, state);

  res.json({
    success: true,
    topic: topic,
    state: state
  });

});

);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
