#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <ThingSpeak.h>
#include "mail.h"

#define SENSOR_PIN 5 // Pino do sensor DS18B20

const char *ssid = "CLARO_2GBAD89A"; // Nome da rede WiFi
const char *password = "7DBAD89A";   // Senha do WiFi
WiFiClient client;
unsigned long myChannelNumber = 2866838; // Channel ID do ThingSpeak
const char *APIkey = "K7SWAKRYYWR9VK96";

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

OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);
float tempC;

unsigned long lastTime = 0;
const unsigned long timerDelay = 300000; // Intervalo de 60s

void setup()
{
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);

    DS18B20.begin();

    WiFi.mode(WIFI_STA);
    Serial.print("Conectando ao WiFi...");
    WiFi.begin(ssid, password);

    int tentativas = 0;
    while (WiFi.status() != WL_CONNECTED && tentativas < 10)
    {
        delay(3000);
        Serial.print(".");
        tentativas++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("\nWiFi conectado com sucesso!");
    }
    else
    {
        Serial.println("\nFalha ao conectar ao WiFi.");
    }

    ThingSpeak.begin(client);
    emailSender.begin();

    DS18B20.requestTemperatures();
    delay(750);
    tempC = DS18B20.getTempCByIndex(0);

    if (tempC != -127.00)
    {
        // Envia e-mail inicial
        String assunto = "Temperatura Inicial";
        String mensagem = "Temperatura atual da geladeira #1 em Campinas: ";
        mensagem.concat(String(tempC, 1));
        mensagem.concat("°C");

        if (!emailSender.sendMail(assunto.c_str(), mensagem.c_str()))
        {
            Serial.println("Falha no envio do e-mail inicial!");
        }
    }
}

void loop()
{
    if ((millis() - lastTime) > timerDelay)
    {
        if (WiFi.status() != WL_CONNECTED) // Reconectar WiFi se desconectar
        {
            Serial.print("\nReconectando ao WiFi...");
            WiFi.begin(ssid, password);

            int tentativas = 0;
            while (WiFi.status() != WL_CONNECTED && tentativas < 10)
            {
                delay(3000);
                Serial.print(".");
                tentativas++;
            }

            if (WiFi.status() == WL_CONNECTED)
            {
                Serial.println("\nWiFi reconectado com sucesso!");
            }
            else
            {
                Serial.println("\nFalha ao reconectar ao WiFi.");
            }
        }

        DS18B20.requestTemperatures();
        delay(750);
        tempC = DS18B20.getTempCByIndex(0);

        if (tempC == -127.00)
        {
            Serial.println("Erro ao ler temperatura! Verifique o sensor.");
        }
        else
        {
            digitalWrite(LED_BUILTIN, HIGH); // Acende LED indicando leitura
            Serial.print("\nTemperatura: ");
            Serial.print(tempC);
            Serial.println("°C");

            int x = ThingSpeak.writeField(myChannelNumber, 1, tempC, APIkey);
            if (x == 200)
            {
                Serial.println("Atualização feita com sucesso.");
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
            else
            {
                Serial.println("Erro ao atualizar ThingSpeak.");
            }

            digitalWrite(LED_BUILTIN, LOW); // Apaga LED após leitura
        }

        lastTime = millis(); // Atualiza o tempo da última leitura
    }
}
