#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Arduino.h>
#include <vector>
#include "mail.h"

// --- Configurações WiFi ---
const char *ssid = "LucasiPhone";
const char *password = "maga1219";

// --- Configurações de e-mail ---
#define SMTP_HOST "smtp.gmail.com"
#define SMTP_PORT 465
#define AUTHOR_EMAIL "iotmail420@gmail.com"
#define AUTHOR_PASSWORD "zzld nfiu tjgt kdjz"

// --- Identificador do dispositivo ---
#define DEVICE_ID "Monitor-Geladeira"

// --- Lista de destinatários (inicialmente vazia) ---
std::vector<String> destinatarios;

// --- Objeto para envio de e-mails ---
MailSender emailSender(
    SMTP_HOST,
    SMTP_PORT,
    AUTHOR_EMAIL,
    AUTHOR_PASSWORD,
    destinatarios);

// --- Endereço do backend e intervalo ---
const char *serverHost = "http://172.20.10.2:8000";
const int sendInterval = 60000; // 60 segundos

// Gera URL para envio de temperatura
String makeTemperatureUrl()
{
  return String(serverHost) + "/api/" + DEVICE_ID + "/temperature/";
}

// Gera URL para lista de e-mails
String makeEmailsUrl()
{
  return String(serverHost) + "/api/emails/addresses/";
}

// --- Configuração do sensor DS18B20 ---
#define SENSOR_PIN 5
OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);
float tempC;

// --- Conecta ao WiFi ---
void connectToWiFi()
{
  Serial.println("\nConectando à rede...");
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000)
  {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("\nFalha na conexão! Reiniciando...");
    delay(1000);
    ESP.restart();
  }

  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  digitalWrite(LED_BUILTIN, HIGH);
}

// --- Envia temperatura ao backend ---
void sendTemperatureData(float temperature)
{
  if (WiFi.status() != WL_CONNECTED)
    return;

  HTTPClient http;
  String url = makeTemperatureUrl();
  if (!http.begin(url))
  {
    Serial.println("Erro ao conectar servidor (temperatura)");
    return;
  }
  http.addHeader("Content-Type", "application/json");

  char tempBuffer[16];
  dtostrf(temperature, 4, 2, tempBuffer);
  String payload = "{\"temperature\":";
  payload.concat(tempBuffer);
  payload.concat("}");


  int code = http.POST(payload);
  if (code >= 200 && code < 300)
  {
    Serial.println("Dados enviados com sucesso");
  }
  else
  {
    Serial.printf("Erro HTTP %d: %s\n", code, http.getString().c_str());
  }
  http.end();
}

// --- Busca lista de e-mails no backend ---
void fetchEmailList()
{
  if (WiFi.status() != WL_CONNECTED)
    return;

  HTTPClient http;
  String url = makeEmailsUrl();
  if (!http.begin(url))
  {
    Serial.println("Erro ao conectar servidor (e-mails)");
    return;
  }

  int code = http.GET();
  if (code == 200)
  {
    String resp = http.getString();
    DynamicJsonDocument doc(1024);
    if (!deserializeJson(doc, resp))
    {
      JsonArray arr = doc.as<JsonArray>();
      std::vector<String> novos;
      for (JsonVariant v : arr)
      {
        novos.push_back(v.as<String>());
      }
      emailSender.setDestinatarios(novos);
      Serial.println("Lista de e-mails atualizada");
    }
    else
    {
      Serial.println("Erro ao parsear JSON de e-mails");
    }
  }
  else
  {
    Serial.printf("Erro HTTP %d ao buscar e-mails\n", code);
  }
  http.end();
}

void setup()
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  DS18B20.begin();
  connectToWiFi();
  fetchEmailList(); // carrega e-mails ao iniciar
}

void loop()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    connectToWiFi();
  }
  else
  {
    DS18B20.requestTemperatures();
    tempC = DS18B20.getTempCByIndex(0);

    if (tempC != DEVICE_DISCONNECTED_C)
    {
      Serial.printf("Temperatura: %.2f°C\n", tempC);
      sendTemperatureData(tempC);

      // Monta mensagem
      String assunto = (tempC > 8.0)
                           ? "‼️ALERTA: TEMPERATURA ELEVADA‼️"
                           : "Monitoramento da Geladeira";
      String mensagem = (tempC > 8.0)
                            ? "Atenção! Temperatura crítica: " + String(tempC, 1) +
                                  "°C.\nVerificar geladeira " + DEVICE_ID + " imediatamente!"
                            : "Temperatura normal: " + String(tempC, 1) + "°C.";

      if (!emailSender.sendMail(assunto.c_str(), mensagem.c_str()))
      {
        Serial.println("Falha no envio de e-mail");
      }
    }
    else
    {
      Serial.println("Erro na leitura do sensor");
    }
  }

  delay(sendInterval);
  fetchEmailList(); // atualiza destinatários a cada ciclo
}
