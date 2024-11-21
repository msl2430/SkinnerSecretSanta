using Newtonsoft.Json;
using RestSharp;
using RestSharp.Authenticators;

namespace SecretSanta.Mailgun
{
    public static class MailgunEmailService
    {
        /* DO NOT COMMIT WITH KEYS - Will flag in Mailgun */
        private static string ApiRoot = "";
        private static string FromDomain = "";
        private static string Domain = "";
        private static string ApiKey = "";

        public static void SendEmail(string giverName, string giverEmail, MemberList.Member recipient, bool isTest)
        {
            var client = new RestClient(ApiRoot)
            {
                Authenticator = new HttpBasicAuthenticator("api", ApiKey)
            };

            recipient.GiverName = giverName;

            var request = new RestRequest("{domain}/messages", Method.POST);
            request.AddParameter("to", $"{giverName} <{giverEmail}> ");
            request.AddParameter("domain", Domain, ParameterType.UrlSegment);
            request.AddParameter("from", $"Secret Santa <donotreply@{FromDomain}>");
            request.AddParameter("subject", $"Secret Santa{(isTest ? " [TEST]" : "")}");
            request.AddParameter("template", "tempss");
            request.AddParameter("t:version", "");
            request.AddParameter("h:X-Mailgun-Variables", JsonConvert.SerializeObject(recipient));
            
            client.Execute(request);
        }
    }
}
