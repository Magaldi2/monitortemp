#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Arduino.h>
#include "mail.h"

// Configurações WiFi
const char *ssid = "LucasiPhone";
const char *password = "maga1219";
// CONFIGURACOES DO EMAIL
#define SMTP_HOST "smtp.gmail.com"
#define SMTP_PORT 465
#define AUTHOR_EMAIL "iotmail420@gmail.com"
#define AUTHOR_PASSWORD "zzld nfiu tjgt kdjz"

// Adicionar os emails para mandar a mensagem
std::vector<String> destinatarios = {
    "magaldlucas6@gmail.com",
    "danielsrossi43@gmail.com",
    "lucasvalber2@gmail.com"};

MailSender emailSender(
    SMTP_HOST,
    SMTP_PORT,
    AUTHOR_EMAIL,
    AUTHOR_PASSWORD,
    destinatarios);

const char *serverUrl = "http://172.20.10.2:8000/api/temperature/"; // alterar para o seu ip da rede (pc deve estar na mesma rede que o esp)
const int sendInterval = 300000;                                    // Envia dados a cada 5 segundos

// Sensor de temperatura
#define SENSOR_PIN 5
OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);
float tempC;
// Função para enviar dados ao servidor (AGORA CORRIGIDA)
void sendTemperatureData(float temperature)
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;

    // Inicia a conexão HTTP
    if (!http.begin(serverUrl))
    {
      Serial.println("Erro ao conectar ao servidor");
      return;
    }

    http.addHeader("Content-Type", "application/json");

    // Cria o payload JSON
    char tempBuffer[10];
    dtostrf(temperature, 4, 2, tempBuffer);

    String payload = "{\"temperature\":";
    payload.concat(tempBuffer);
    payload.concat("}");

    // Envia a requisição POST
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0)
    {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    }
    else
    {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      Serial.print("Resposta: ");
      Serial.println(http.getString());
    }

    http.end();
  }
  else
  {
    Serial.println("WiFi desconectado - Dados não enviados");
  }
}

void connectToWiFi()
{
  Serial.println("\nConectando à rede");

  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - startAttemptTime < 20000)
  { // Timeout de 20s
    delay(500);
    Serial.print(".");
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN)); // Pisca LED
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("\nFalha na conexão! Reiniciando...");
    delay(1000);
    ESP.restart(); // Reinicia o ESP se não conectar
  }
  else
  {
    Serial.println("\nConectado com sucesso!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_BUILTIN, HIGH); // LED aceso quando conectado
  }
}

void setup()
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  DS18B20.begin();
  connectToWiFi();
  // emailSender.begin();
  // remover essa linha pra nao fica enviando email infinito
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
    }
    else
    {
      Serial.println("Erro na leitura do sensor!");
    }
  }
  delay(sendInterval);

  if (tempC > 25.0)
  {
    String assunto = "‼️ALERTA: TEMPERATURA ELEVADA!!‼️";
    String mensagem = "Atenção! Temperatura critica detectada na geladeira de vacinas:";
    mensagem.concat(String(tempC, 1));
    mensagem.concat("°C\n");
    mensagem += "Ação necessária: Verificar geladeira imediatamente!";

    if (!emailSender.sendMail(assunto.c_str(), mensagem.c_str()))
    {
      Serial.println("Falha no envio do alerta!");
    }
  }
  else
  {
    String assunto = "Monitoramento da Geladeira";
    String mensagem = "Temperatura normal: ";
    mensagem.concat(String(tempC, 1));
    mensagem.concat("°C\n");
    if (!emailSender.sendMail(assunto.c_str(), mensagem.c_str()))
    {
      Serial.println("Falha no envio do relatório normal!");
    }
  }
}