#ifndef mail_H
#define mail_H
#include <ESP_Mail_Client.h>
#include <vector>

class MailSender
{
public:
    MailSender(
        const char *smtpHost,
        int smtpPort,
        const char *email,
        const char *password,
        std::vector<String> recipients);
    void begin();
    bool sendMail(const char *subject, const char *message);

private:
    SMTPSession _smtp;
    Session_Config _config;
    const char *_recipient;
    std::vector<String> _recipients;
    static MailSender *instance;
    static void _smtpCallback(SMTP_Status status);
};
#endif