using Newtonsoft.Json;
using RestSharp;
using RestSharp.Authenticators;

namespace SecretSanta.Mailgun
{
    public static class MailgunEmailService
    {
        /* DO NOT COMMIT WITH KEYS - Will flag in Mailgun */
        private static string ApiRoot = "https://api.mailgun.net/v3";
        private static string FromDomain = "mail.goelevent.com";
        private static string MailgunDomain = "mail.goelevent.com";
        private static string MailgunApiKey = "key-cfb7b778a48c6aa7b310d30727fbf511";

        public static void SendEmail(string giverName, string giverEmail, MemberList.Member recipient, bool isTest)
        {
            var client = new RestClient(ApiRoot)
            {
                Authenticator = new HttpBasicAuthenticator("api", MailgunApiKey)
            };

            recipient.GiverName = giverName;

            var request = new RestRequest("{domain}/messages", Method.POST);
            request.AddParameter("to", $"{giverName} <{giverEmail}> ");
            request.AddParameter("domain", MailgunDomain, ParameterType.UrlSegment);
            request.AddParameter("from", $"Secret Santa <donotreply@{FromDomain}>");
            request.AddParameter("subject", $"Secret Santa{(isTest ? " [TEST]" : "")}");
            request.AddParameter("template", "tempss");
            request.AddParameter("t:version", "mavencamp");
            request.AddParameter("h:X-Mailgun-Variables", JsonConvert.SerializeObject(recipient));
            
            client.Execute(request);
        }
    }
}
