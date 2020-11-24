using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using SecretSanta.Mailgun;

namespace SecretSanta
{
    public class MemberList
    {
        public IList<Member> Members { get; set; }

        public class Member
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public IList<int> Ineligible { get; set; }
            public string Email { get; set; }
            public string PantSize { get; set; }
            public string ShirtSize { get; set; }
            public string ShoeSize { get; set; }
            public IList<GiftItem> FavoriteThings { get; set; }
            public IList<string> DoNotBuy { get; set; }
            public IList<GiftItem> SpouseSuggestion { get; set; }

            public Member() 
            {
                Ineligible = new List<int>();
                FavoriteThings = new List<GiftItem>();
                DoNotBuy = new List<string>();
                SpouseSuggestion = new List<GiftItem>();
            }

            public class GiftItem
            {
	            public string Name { get; set; }
	            public string Description { get; set; }
	            public string Url { get; set; }
            }
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            var isTest = true;
            Console.WriteLine("Are you running this as a test: (Y/N)");
            var answer = Console.ReadKey();
            isTest = answer.KeyChar == 'y' || answer.KeyChar == 'Y';
            Start:
            var results = new List<Dictionary<MemberList.Member, MemberList.Member>>();
            using (var file = File.OpenText("members.json"))
            using(var reader = new JsonTextReader(file))
            {
	            var obj = JToken.ReadFrom(reader);
                var memberList = obj.ToObject<MemberList>();
                Console.WriteLine($"\nNumber of players: {memberList.Members.Count}");
                Console.WriteLine("Randomizing...\n");

                while (results.Count < memberList.Members.Count)
                {
                    MemberList.Member giver = null;
                    while (giver == null)
                    {
                        var rand = (new Random(Guid.NewGuid().GetHashCode()).Next(1, memberList.Members.Count + 1));
                        giver = results.Any(r => r.Keys.Any(k => k.Id == rand))
                            ? null
                            : memberList.Members.First(m => m.Id == rand);
                    }
                    Console.WriteLine("Randomizing giver: " + giver.Name);
                    MemberList.Member receiver = null;
                    var checkCount = 0;
                    while (receiver == null)
                    {
                        var rand = (new Random(Guid.NewGuid().GetHashCode()).Next(1, memberList.Members.Count + 1));
                        receiver = giver.Ineligible.Contains(rand) || giver.Id == rand || results.Any(r => r.Values.Any(v => v.Id == rand))
                            ? null
                            : memberList.Members.First(m=> m.Id == rand);
                        checkCount++;
                        if (checkCount > 5)
                            goto Start;
                    }
                    if (isTest)
                    {
                        Console.WriteLine($"Giver: {giver.Name} => Receiver: {receiver.Name}\n");
                    }

                    results.Add(new Dictionary<MemberList.Member, MemberList.Member>() {{giver, receiver}});
                }

                Console.WriteLine("Randomizing complete");             
            }

            if (isTest)
            {
	            foreach (var email in results)
	            {
                    MailgunEmailService.SendEmail(email.First().Key.Name, "me@mikeslevine.com", email.First().Value, true);
	            }
                Console.WriteLine("Press any key to exit");
                Console.ReadKey();
                return;
            }

            Console.WriteLine("Preparing Emails...");

            foreach (var email in results)
            {
	            MailgunEmailService.SendEmail(email.First().Key.Name, email.First().Key.Email, email.First().Value, false);
            }

            Console.WriteLine("\nEmails sent");
            Console.WriteLine("Press any key to exit");
            Console.ReadLine();
        }
    }
}
