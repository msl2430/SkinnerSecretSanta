using System;
using System.Net;
using System.Net.Mail;

namespace SecretSanta
{
    internal sealed class EmailService
    {
        private SmtpClient _smtpClient { get; set; }
        private SmtpClient SmtpClient => _smtpClient ?? (_smtpClient = new SmtpClient
        {
            Host = "smtp.gmail.com",
            Port = 587,
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential("msl2430", "cwvinilfnsihvioh")
        });

        public bool SendEmail(MailMessage msg)
        {
            try
            {
                SmtpClient.Send(msg);
            }
            catch (Exception ex)
            {
                return false;
            }
            return true;
        }        
    }
}
