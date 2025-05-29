#ifndef MAIL_H
#define MAIL_H

#include <vector>
#include <WString.h>

class MailSender
{
private:
    const char *smtpServer;
    int smtpPort;
    const char *email;
    const char *password;
    std::vector<String> destinatarios;

public:
    MailSender(const char *smtpServer, int smtpPort, const char *email, const char *password, std::vector<String> destinatarios);

    bool sendMail(const char *assunto, const char *mensagem);

    void setDestinatarios(std::vector<String> novosDestinatarios);
};

#endif
