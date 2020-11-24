using System;
using System.Net.Mail;

namespace SecretSanta
{
    internal sealed class EmailService
    {
        private SmtpClient _smtpClient { get; set; }
        private SmtpClient SmtpClient => _smtpClient ?? (_smtpClient = new SmtpClient("10.1.0.8"));

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
