#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "NetManager.h"

#define SENSOR_PIN 5
const char *deviceId = "Monitor-Geladeira";
const char *serverHost = "";
const int sendInterval = 600000; // ms 

NetManager network;
OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);

std::vector<float> dataLog;

void sendTempData(float temp){
    if(WiFi.status() != WL_CONNECTED){
        Serial.println("Wifi not connected. Skipping send.");
        return;
    }

    HTTPClient http;
    String url = String(serverHost) + "/api/" + deviceId + "/temperature/";

    if(!http.begin(url)){
        Serial.println("Server connection error!");
        return;
    }

    http.addHeader("Content-Type", "application/json");

    String payload = "{\"temperature\":"; // payload = {temperature: temp}
    payload.concat(String(temp, 2));
    payload.concat("}");

    int statusCode = http.POST(payload);

    if(statusCode >= 200 && statusCode < 300){
        Serial.printf("Sent: %.2f C (Status: %d)\n", temp, statusCode);
    } else {
        Serial.printf("Error HTTP %d: %s\n", statusCode, http.getString().c_str());
    }
    
    http.end();
};

void setup(){
    Serial.begin(115200);
    DS18B20.begin();
    Serial.println("Inicializing...");
    network.begin();
};

void loop(){
    DS18B20.requestTemperatures();
    float tempC = DS18B20.getTempCByIndex(0);

    dataLog.push_back(tempC);

    if (dataLog.size() > 10){
       dataLog.erase(dataLog.begin());
    }

    if (tempC != DEVICE_DISCONNECTED_C){
      Serial.printf("Temperature: %2.f C\n", tempC);
    } else {
      Serial.println("Error: sensor not connected");
    }

    delay(sendInterval);
}