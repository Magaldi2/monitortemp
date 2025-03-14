#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define SENSOR_PIN 5 // Esta conectado no pino GPI05 ou D5

OneWire oneWire(SENSOR_PIN);
DallasTemperature DS18B20(&oneWire);
float tempC;

void setup()
{
    pinMode(LED_BUILTIN,OUTPUT);
    Serial.begin(9600);
    DS18B20.begin();
}

void loop()
{
    DS18B20.requestTemperatures();
    tempC = DS18B20.getTempCByIndex(0);

    digitalWrite(LED_BUILTIN, HIGH);
    Serial.print("\ntemperatura:");
    Serial.print(tempC);
    Serial.print("°C:\n");
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
}