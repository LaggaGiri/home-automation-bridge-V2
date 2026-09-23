const express = require("express");
const mqtt = require("mqtt");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// ========================================
// HiveMQ Configuration
// ========================================

const MQTT_HOST =
  "mqtts://bd677f2b30e04a8386c8e8295200a313.s1.eu.hivemq.cloud:8883";

const MQTT_USERNAME =
  process.env.MQTT_USERNAME;

const MQTT_PASSWORD =
  process.env.MQTT_PASSWORD;

// ========================================
// MQTT Topic
// ========================================

const MQTT_TOPIC =
  "home/ESP001/command";

// ========================================
// Startup
// ========================================

console.log("----------------------------------------");
console.log("ESP32 MQTT BRIDGE");
console.log("----------------------------------------");

console.log(
    "MQTT Username configured:",
    !!MQTT_USERNAME
);

console.log(
    "MQTT Password configured:",
    !!MQTT_PASSWORD
);

// ========================================
// MQTT Client
// ========================================

const mqttClient = mqtt.connect(
    MQTT_HOST,
    {
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
        protocol: "mqtts",
        port: 8883,
        reconnectPeriod: 5000
    }
);

// ========================================
// MQTT Connected
// ========================================

mqttClient.on("connect", () => {

    console.log("----------------------------------------");

    console.log(
        "CONNECTED TO HIVEMQ"
    );

    console.log("----------------------------------------");

    console.log(
        "MQTT Topic:",
        MQTT_TOPIC
    );

});

// ========================================
// MQTT Error
// ========================================

mqttClient.on("error", (error) => {

    console.error(
        "MQTT ERROR:",
        error.message
    );

});

// ========================================
// MQTT Reconnect
// ========================================

mqttClient.on("reconnect", () => {

    console.log(
        "Reconnecting to HiveMQ..."
    );

});

// ========================================
// Health Check
// ========================================

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        service: "ESP32 MQTT Bridge",

        status: "running",

        mqttConnected:
            mqttClient.connected

    });

});

// ========================================
// MQTT Status
// ========================================

app.get("/mqtt-status", (req, res) => {

    res.status(200).json({

        success: true,

        mqttConnected:
            mqttClient.connected,

        topic: MQTT_TOPIC

    });

});

// ========================================
// POST /message
// ========================================

app.post("/message", (req, res) => {

    console.log();

    console.log(
        "========================================"
    );

    console.log(
        "POST REQUEST RECEIVED"
    );

    console.log(
        "========================================"
    );

    console.log(
        "Request Body:"
    );

    console.log(
        JSON.stringify(req.body, null, 2)
    );

    // ====================================
    // Check MQTT Connection
    // ====================================

    if (!mqttClient.connected) {

        console.error(
            "MQTT broker is not connected."
        );

        return res.status(503).json({

            success: false,

            error:
                "MQTT broker is not connected"

        });

    }

    // ====================================
    // Get Message
    // ====================================

    const message =
        req.body.message;

    if (
        message === undefined ||
        message === null
    ) {

        return res.status(400).json({

            success: false,

            error:
                "message is required"

        });

    }

    // ====================================
    // Convert Message to String
    // ====================================

    let mqttMessage;

    if (
        typeof message === "string"
    ) {

        mqttMessage = message;

    } else {

        mqttMessage =
            JSON.stringify(message);

    }

    // ====================================
    // Publish MQTT
    // ====================================

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

                    error:
                        "Failed to publish MQTT message"

                });

            }

            console.log();

            console.log(
                "MQTT MESSAGE PUBLISHED"
            );

            console.log(
                "Topic:",
                MQTT_TOPIC
            );

            console.log(
                "Message:",
                mqttMessage
            );

            console.log();

            return res.status(200).json({

                success: true,

                topic: MQTT_TOPIC,

                message: mqttMessage

            });

        }

    );

});

// ========================================
// 404
// ========================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error:
            "Endpoint not found"

    });

});

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {

    console.log();

    console.log(
        "========================================"
    );

    console.log(
        `Server running on port ${PORT}`
    );

    console.log(
        "========================================"
    );

});
