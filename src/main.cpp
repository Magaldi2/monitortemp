#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <ThingSpeak.h>

#define SENSOR_PIN 5 // Pino do sensor DS18B20

const char *ssid = "Lucas’s iPhone"; // Nome da rede WiFi
const char *password = "lucas123";   // Senha do WiFi
WiFiClient client;
unsigned long myChannelNumber = 2866838; // Channel ID do ThingSpeak
const char *APIkey = "K7SWAKRYYWR9VK96";

OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);
float tempC;

unsigned long lastTime = 0;
const unsigned long timerDelay = 60000; // Intervalo de 60s

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
