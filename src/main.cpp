#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Configurações WiFi
const char* ssid = "SpyNetwork";
const char* password = "eugostodetortas";


const char* serverUrl = "http://172.16.227.128:8000/api/temperature";
const int sendInterval = 5000; // Envia dados a cada 5 segundos

// Sensor de temperatura
#define SENSOR_PIN 5
OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);

// Função para enviar dados ao servidor (AGORA CORRIGIDA)
void sendTemperatureData(float temperature) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Inicia a conexão HTTP
    if (!http.begin(serverUrl)) {
      Serial.println("Erro ao conectar ao servidor");
      return;
    }
    
    http.addHeader("Content-Type", "application/json");
    
    // Cria o payload JSON
    String payload = "{\"temperature\":" + String(temperature) + "}";
    
    // Envia a requisição POST
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      Serial.print("Resposta: ");
      Serial.println(http.getString());
    }
    
    http.end();
  } else {
    Serial.println("WiFi desconectado - Dados não enviados");
  }
}

void connectToWiFi() {
  Serial.println("\nConectando à rede: " + String(ssid));
  
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && 
         millis() - startAttemptTime < 20000) { // Timeout de 20s
    delay(500);
    Serial.print(".");
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN)); // Pisca LED
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nFalha na conexão! Reiniciando...");
    delay(1000);
    ESP.restart(); // Reinicia o ESP se não conectar
  } else {
    Serial.println("\nConectado com sucesso!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_BUILTIN, HIGH); // LED aceso quando conectado
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  DS18B20.begin();
  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  } else {
    DS18B20.requestTemperatures();
    float tempC = DS18B20.getTempCByIndex(0);
    
    if (tempC != DEVICE_DISCONNECTED_C) {
      Serial.print("Temperatura: ");
      Serial.print(tempC);
      Serial.println("°C");
      
      sendTemperatureData(tempC);
    } else {
      Serial.println("Erro na leitura do sensor!");
    }
  }
  delay(sendInterval);
}