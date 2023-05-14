const nodemailer = require("nodemailer");
const json = require(handlersDir + "Storage/File/JSONHandler.js");
class EmailHandler
{
    constructor()
    {
        this.config =
            {
                pool: json.GetConfig("config.json", "EMAIL_POOL_ENABLED"),
                maxConnections: json.GetConfig("config.json", "EMAIL_POOL_MAX_CONNECTIONS"),
                host: json.GetConfig("config.json", "EMAIL_HOST"),
                port: json.GetConfig("config.json", "EMAIL_PORT"),
                secure: json.GetConfig("config.json", "EMAIL_SSL"),
                auth: {
                    user: json.GetConfig("config.json", "EMAIL_USERNAME"),
                    password: json.GetConfig("config.json", "EMAIL_PASSWORD"),
                },
            };

        if (json.GetConfig("config.json", "EMAIL_ALLOW_SELF_CERT"))
        {
            this.config["tls"] = { rejectUnauthorized: false}
        }
    }

    Init()
    {
        this.transporter = nodemailer.createTransport(this.config);

        this.TestConnection();

    }

    GetEmailClient()
    {
        return this.transporter;
    }

    TestConnection()
    {
        this.transporter.verify((error, success) =>
        {
            if (error) return false;
            return true;
        })
    }

    SendEmail(sendTo, subjectText, messageBodyText, messageBodyHTML, messageCallback)
    {
        let message =
            {
                from: json.GetConfig("config.json", "EMAIL_FROM_NAME") + " " + json.GetConfig("config.json", "EMAIL_FROM_ADDRESS"),
                to: sendTo,
                subject: subjectText,
                text: messageBodyText,
                html: messageBodyHTML,
                replyTo: json.GetConfig("config.json", "EMAIL_REPLY_ADDRESS"),
            }

        this.transporter.sendMail(message, messageCallback);

    }

    static GetInstance()
    {
        if (!this.instance)
        {
            this.instance = new EmailHandler();
        }

        return this.instance;
    }
}


module.exports = EmailHandler;