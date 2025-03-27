#include "mail.h"
#include <Arduino.h>

MailSender *MailSender::instance = nullptr;
// CONFIG do EMAIL
MailSender::MailSender(
    const char *smtpHost,
    int smtpPort,
    const char *email,
    const char *password,
    std::vector<String> recipients)
{
    // Configurações básicas
    instance = this;
    _config.server.host_name = smtpHost;
    _config.server.port = smtpPort;
    _config.login.email = email;
    _config.login.password = password;
    _config.time.ntp_server = "pool.ntp.org,time.nist.gov";
    _config.time.gmt_offset = -3 * 3600; // GMT-3 em segundos
    _config.time.day_light_offset = 0;

    _recipients = recipients;
}

void MailSender::begin()
{
    _smtp.debug(1);
    _smtp.callback(_smtpCallback);
}

// Funcao de mandar o EMAIL
bool MailSender::sendMail(const char *subject, const char *message)
{
    SMTP_Message msg;
    msg.sender.name = "ESP";
    msg.sender.email = _config.login.email;
    msg.subject = subject;

    // Le os emails dos usuarios
    for (String& recipient : _recipients)
    {
        msg.addRecipient("Usuario", recipient.c_str());
    }

    msg.text.content = strdup(message);
    msg.text.charSet = "us-ascii";

    if (!_smtp.connect(&_config))
    {
        Serial.println("Falha na conexao com o SMTP!");

        return false;
    }

    if (!MailClient.sendMail(&_smtp, &msg))
    {
        ESP_MAIL_PRINTF("Erro: %s\n", _smtp.errorReason().c_str());

        return false;
    }

    return true;
}

void MailSender::_smtpCallback(SMTP_Status status)
{
    if (instance)
    {
        Serial.println(status.info());

        // Verifica se o envio foi completado com sucesso
        if (status.success())
        {
            Serial.println("----------------");
            ESP_MAIL_PRINTF("Mensagens enviadas: %d\n", status.completedCount());
            ESP_MAIL_PRINTF("Mensagens falhas: %d\n", status.failedCount());
            Serial.println("----------------\n");

            // Limpar resultados de envio
            instance->_smtp.sendingResult.clear();
        }

        // Verifica códigos de erro específicos
        if (instance->_smtp.statusCode() < 0)
        { // Códigos negativos são erros internos
            Serial.print("Erro SMTP: ");
            Serial.println(instance->_smtp.errorReason().c_str());
        }
    }
}