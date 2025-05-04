#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Arduino.h>
#include "mail.h"

// Configurações WiFi
const char *ssid = ""; // Nome da rede WiFi
const char *password = ""; // Senha da rede WiFi

// Configurações de e-mail
#define SMTP_HOST "smtp.gmail.com"
#define SMTP_PORT 465
#define AUTHOR_EMAIL "iotmail420@gmail.com"
#define AUTHOR_PASSWORD "zzld nfiu tjgt kdjz"

// Inicializa com uma lista vazia (será carregada depois)
std::vector<String> destinatarios;

MailSender emailSender(
    SMTP_HOST,
    SMTP_PORT,
    AUTHOR_EMAIL,
    AUTHOR_PASSWORD,
    destinatarios);

// Configurações do servidor
const char *serverUrlTemp = "http://192.168.0.221:8000/api/temperature/";
const char *serverUrlEmails = "http://192.168.0.221:8000/api/emails/addresses/";
const int sendInterval = 60000; // 5 minutos

// Sensor de temperatura
#define SENSOR_PIN 5
OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);
float tempC;

// Função para enviar temperatura ao servidor
void sendTemperatureData(float temperature)
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;

    if (!http.begin(serverUrlTemp))
    {
      Serial.println("Erro ao conectar ao servidor (temperatura)");
      return;
    }

    http.addHeader("Content-Type", "application/json");

    char tempBuffer[10];
    dtostrf(temperature, 4, 2, tempBuffer);

    String payload = "{\"temperature\":";
    payload.concat(tempBuffer);
    payload.concat("}");

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0)
    {
      Serial.print("Código de resposta HTTP: ");
      Serial.println(httpResponseCode);
    }
    else
    {
      Serial.print("Erro HTTP: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
  else
  {
    Serial.println("WiFi desconectado - Dados não enviados");
  }
}

// Função para buscar lista de e-mails atualizada
void fetchEmailList()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;

    if (!http.begin(serverUrlEmails))
    {
      Serial.println("Erro ao conectar para buscar e-mails");
      return;
    }

    int httpResponseCode = http.GET();

    if (httpResponseCode == 200)
    {
      String response = http.getString();
      Serial.println("Emails recebidos: " + response);

      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, response);

      if (doc.is<JsonArray>())
      {
        std::vector<String> novosDestinatarios;
        for (auto email : doc.as<JsonArray>())
        {
          novosDestinatarios.push_back(email.as<String>());
        }
        emailSender.setDestinatarios(novosDestinatarios);
      }
      else
      {
        Serial.println("Resposta não é um array de e-mails");
      }
    }
    else
    {
      Serial.print("Erro ao buscar e-mails: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
}

// Conectar WiFi
void connectToWiFi()
{
  Serial.println("\nConectando à rede");

  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 20000)
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
  else

  {
    Serial.println("\nConectado com sucesso!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_BUILTIN, HIGH);
  }
}

void setup()
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  DS18B20.begin();
  connectToWiFi();
  fetchEmailList(); // Buscar os e-mails logo no começo
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
      Serial.print("Temperatura: ");
      Serial.print(tempC);
      Serial.println("°C");

      sendTemperatureData(tempC);

      if (tempC > 25.0)
      {
        String assunto = "‼️ALERTA: TEMPERATURA ELEVADA‼️";
        String mensagem = "Atenção! Temperatura crítica detectada: ";
        mensagem.concat(String(tempC, 1));
        mensagem.concat("°C.\nVerificar a geladeira imediatamente!");

        if (!emailSender.sendMail(assunto.c_str(), mensagem.c_str()))
        {
          Serial.println("Falha no envio de alerta!");
        }
      }
      else
      {
        String assunto = "Monitoramento da Geladeira";
        String mensagem = "Temperatura normal: ";
        mensagem.concat(String(tempC, 1));
        mensagem.concat("°C.");

        if (!emailSender.sendMail(assunto.c_str(), mensagem.c_str()))
        {
          Serial.println("Falha no envio de relatório!");
        }
      }
    }
    else
    {
      Serial.println("Erro na leitura do sensor!");
    }
  }

  delay(sendInterval);

  fetchEmailList(); // Atualizar lista de e-mails a cada ciclo
}
