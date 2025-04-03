#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Configurações WiFi
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SENHA_WIFI";

// Configurações do servidor
const char* serverUrl = "http://SEU_IP_LOCAL:8000/api/temperature";
const int sendInterval = 5000; // Envia dados a cada 5 segundos

// Sensor de temperatura
#define SENSOR_PIN 5
OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);

void connectToWiFi() {
  Serial.print("Conectando à rede WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Conectado ao WiFi");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void sendTemperatureData(float temperature) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"temperature\":" + String(temperature) + "}";
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  DS18B20.begin();
  
  connectToWiFi();
}

void loop() {
  DS18B20.requestTemperatures();
  float tempC = DS18B20.getTempCByIndex(0);
  
  Serial.print("Temperatura: ");
  Serial.print(tempC);
  Serial.println("°C");
  
  digitalWrite(LED_BUILTIN, HIGH);
  sendTemperatureData(tempC);
  digitalWrite(LED_BUILTIN, LOW);
  
  delay(sendInterval);
}