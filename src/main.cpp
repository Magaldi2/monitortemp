#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <ThingSpeak.h>
#include <ESP_Mail_Client.h>

#define SENSOR_PIN 5 // Pino do sensor DS18B20

const char *ssid = "Lucas’s iPhone"; // Nome da rede WiFi
const char *password = "maga1219";   // Senha do WiFi
WiFiClient client;
unsigned long myChannelNumber = 2866838; // Channel ID do ThingSpeak
const char *APIkey = "K7SWAKRYYWR9VK96";

#define SMTP_HOST "smtp.gmail.com"
#define SMTP_PORT 465
#define AUTHOR_EMAIL "iotmail420@gmail.com"
#define AUTHOR_PASSWORD "hamiltoncriadms!"
#define RECIPIENT_EMAIL "magaldlucas6@gmail.com"

SMTPSession smtp;
void smtpCallback(SMTP_Status status);

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
    smtp.debug(1);
    smtp.callback(smtpCallback);
    Session_Config config;
    config.server.host_name = SMTP_HOST;
    config.server.port = SMTP_PORT;
    config.login.email = AUTHOR_EMAIL;
    config.login.password = AUTHOR_PASSWORD;
    config.login.user_domain = "";

    config.time.ntp_server = F("pool.ntp.org,time.nist.gov");
    config.time.gmt_offset = -3 + 12; // Para o Brasil (GMT-3), somamos 12 -> 9
    config.time.day_light_offset = 0; // Se horário de verão for necessário, coloque 1

    SMTP_Message message;

    message.sender.name = F("ESP");
    message.sender.email = AUTHOR_EMAIL;
    message.subject = F("AUGUSTO O GIGANTESCO!!");
    message.addRecipient(F("Magas"), RECIPIENT_EMAIL);

    String textMsg = "GIGANTESCO! GIGANTESCO! GIGANTESCO! GIGANTESCO!";
    message.text.content = textMsg.c_str();
    message.text.charSet = "br-ascii";
    message.text.transfer_encoding = Content_Transfer_Encoding::enc_7bit;
    message.response.notify = esp_mail_smtp_notify_success | esp_mail_smtp_notify_failure | esp_mail_smtp_notify_delay;

    if (!smtp.connect(&config))
    {
        ESP_MAIL_PRINTF("Erro de conexão! Status Code: %d, Error Code: %d, Reason: %s", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
        return;
    }
    if (!smtp.isLoggedIn())
    {
        Serial.println("Você não está logado!");
    }
    else
    {
        if (smtp.isAuthenticated())
            Serial.println("\n Sucesso em logar!");
        else
            Serial.println("\nConexão sem autenticar!");
    }

    if (!MailClient.sendMail(&smtp, &message))
        ESP_MAIL_PRINTF("Error, Status Code: %d, Error Code: %d, Reason: %s", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
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

void smtpCallback(SMTP_Status status)
{
    /* Print the current status */
    Serial.println(status.info());

    /* Print the sending result */
    if (status.success())
    {
        // ESP_MAIL_PRINTF used in the examples is for format printing via debug Serial port
        // that works for all supported Arduino platform SDKs e.g. AVR, SAMD, ESP32 and ESP8266.
        // In ESP8266 and ESP32, you can use Serial.printf directly.

        Serial.println("----------------");
        ESP_MAIL_PRINTF("Message sent success: %d\n", status.completedCount());
        ESP_MAIL_PRINTF("Message sent failed: %d\n", status.failedCount());
        Serial.println("----------------\n");

        for (size_t i = 0; i < smtp.sendingResult.size(); i++)
        {
            /* Get the result item */
            SMTP_Result result = smtp.sendingResult.getItem(i);

            // In case, ESP32, ESP8266 and SAMD device, the timestamp get from result.timestamp should be valid if
            // your device time was synched with NTP server.
            // Other devices may show invalid timestamp as the device time was not set i.e. it will show Jan 1, 1970.
            // You can call smtp.setSystemTime(xxx) to set device time manually. Where xxx is timestamp (seconds since Jan 1, 1970)

            ESP_MAIL_PRINTF("Message No: %d\n", i + 1);
            ESP_MAIL_PRINTF("Status: %s\n", result.completed ? "success" : "failed");
            ESP_MAIL_PRINTF("Date/Time: %s\n", MailClient.Time.getDateTimeString(result.timestamp, "%B %d, %Y %H:%M:%S").c_str());
            ESP_MAIL_PRINTF("Recipient: %s\n", result.recipients.c_str());
            ESP_MAIL_PRINTF("Subject: %s\n", result.subject.c_str());
        }
        Serial.println("----------------\n");

        // You need to clear sending result as the memory usage will grow up.
        smtp.sendingResult.clear();
    }
}