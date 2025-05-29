#include "mail.h"
#include <ESP_Mail_Client.h> // Certifique-se que você está usando a lib certa

MailSender::MailSender(const char *smtpServer, int smtpPort, const char *email, const char *password, std::vector<String> destinatarios)
    : smtpServer(smtpServer), smtpPort(smtpPort), email(email), password(password), destinatarios(destinatarios) {}

void MailSender::setDestinatarios(std::vector<String> novosDestinatarios)
{
    destinatarios = novosDestinatarios;
}

bool MailSender::sendMail(const char *assunto, const char *mensagem)
{
    SMTPSession smtp;
    ESP_Mail_Session session;

    session.server.host_name = smtpServer;
    session.server.port = smtpPort;
    session.login.email = email;
    session.login.password = password;
    session.login.user_domain = "";

    SMTP_Message message;
    message.sender.name = "ESP32 Monitor";
    message.sender.email = email;
    message.subject = assunto;
    message.addRecipient("Destinatário", destinatarios[0].c_str()); // Envia para o primeiro

    // Enviar para os demais se houver
    for (size_t i = 1; i < destinatarios.size(); i++)
    {
        message.addRecipient("Destinatário Extra", destinatarios[i].c_str());
    }

    message.text.content = mensagem;
    message.text.charSet = "utf-8";
    message.text.transfer_encoding = Content_Transfer_Encoding::enc_7bit;

    if (!smtp.connect(&session))
    {
        Serial.println("Erro de conexão SMTP");
        return false;
    }

    if (!MailClient.sendMail(&smtp, &message))
    {
        Serial.print("Erro ao enviar: ");
        Serial.println(smtp.errorReason());
        return false;
    }

    smtp.closeSession();
    return true;
}
