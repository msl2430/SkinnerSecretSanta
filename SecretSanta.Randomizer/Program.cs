using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Runtime.InteropServices;
using SecretSanta.Mailgun;

namespace SecretSanta
{
    public class MemberList
    {
        public IList<Member> Members { get; set; }

        [Serializable]
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

            public string GiverName { get; set; }

            public Member() 
            {
                Ineligible = new List<int>();
                FavoriteThings = new List<GiftItem>();
                DoNotBuy = new List<string>();
                SpouseSuggestion = new List<GiftItem>();
            }

            [Serializable]
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
        private const bool IsFullEmail = true;

        public static void Main(string[] args)
        {
            var isTest = true;
            Console.WriteLine("Are you running this as a test: (Y/N)");
            var answer = Console.ReadKey();
            isTest = answer.KeyChar == 'y' || answer.KeyChar == 'Y';
            Start:
            var results = new List<Dictionary<MemberList.Member, MemberList.Member>>();
            using (var file = File.OpenText("members_2023.json"))
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
                    
                    new EmailService().SendEmail(new MailMessage("msl2430@gmail.com", "me@mikeslevine.com")
                    {
                        From = new MailAddress("SecretSanta@gmail.com", "Secret Santa"),
                        Subject = $"Secret Santa [TEST]", 
                        Body = IsFullEmail 
                            ? GetResultsWithGiftEmail(email.First().Key.Name, email.First().Value.Name, email.First().Value) 
                            : GetResultsEmail(email.First().Key.Name, email.First().Value.Name),
                        IsBodyHtml = true
                    });
                }
                Console.WriteLine("Press any key to exit");
                Console.ReadKey();
                return;
            }

            Console.WriteLine("Preparing Emails...");

            foreach (var email in results)
            {
                new EmailService().SendEmail(new MailMessage("msl2430@gmail.com", email.First().Key.Email)
                {
                    From = new MailAddress("SecretSanta@gmail.com", "Secret Santa"),
                    Subject = $"Secret Santa",
                    Body = IsFullEmail
                        ? GetResultsWithGiftEmail(email.First().Key.Name, email.First().Value.Name, email.First().Value)
                        : GetResultsEmail(email.First().Key.Name, email.First().Value.Name),
                    IsBodyHtml = true
                });
            }

            Console.WriteLine("Press any key to exit");
            Console.ReadLine();
        }

        private static string GetResultsEmail(string giverName, string receiverName)
        {
            return $@"<html xmlns='http://www.w3.org/1999/xhtml' style='width: 100%;'>
                    <head>
	                    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
                    </head>
                    <body style='background-color: white; margin: 0; padding: 0; font-family: 'arial', 'sans-serif'; width: 100%;'>
	                    <table width='640px' cellpadding='0' cellspacing='0' border='0' style='margin: 0 auto;'>
	                    <tr>
		                    <td>
			                    <table cellpadding='0' cellspacing='0' class='table-row'>
				                    <tr>
					                    <td colspan='3' align='center' style='padding-top: 10px; background-color: white; text-align: left; font-size: 12px; line-height: 18px; mso-line-height-rule: exactly;'>
					                        <div style='font-size: 18px; line-height: 16px; mso-line-height-rule: exactly; font-weight: bold;'>&nbsp;</div>
						                    <span>
							                    {giverName},
						                    </span>
						                    <div style='font-size: 16px; line-height: 16px; mso-line-height-rule: exactly;'>&nbsp;</div>
						                    <span>
							                    This year your Secret Santa is:
						                    </span>
						                    <div style='font-size: 14px; line-height: 14px; mso-line-height-rule: exactly;'>&nbsp;</div>
						                    <span style='font-size: 22px; line-height: 30px; mso-line-height-rule: exactly;'>
							                    <b>{receiverName}</b>
						                    </span>
						                    <div style='font-size: 14px; line-height: 14px; mso-line-height-rule: exactly;'>&nbsp;</div>
						                    <div style='font-size: 16px; line-height: 16px; mso-line-height-rule: exactly;'>&nbsp;</div>
						                    <div style='font-size: 16px; line-height: 16px; mso-line-height-rule: exactly;'>&nbsp;</div>
					                    </td>
				                    </tr>
				                    <tr>
				                    <td colspan='3' style='padding: 8px; line-height: 1.42857143; vertical-align: top;'>

				                    </td>
			                    </tr>
		                    </table>
		                    </td>
	                    </tr>
                    </table>
                    </body>
                    </html>";
        }

        private static string GetResultsWithGiftEmail(string giverName, string receiverName, MemberList.Member giftSuggestions)
        {
            var result = $@"<html xmlns='http://www.w3.org/1999/xhtml' style='width: 100%;'>
                            <head>
	                            <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
                            </head>
                            <body style='background-color: white; margin: 0; padding: 0; font-family: 'arial', 'sans-serif'; width: 100%;'>
	                            <table width='640px' cellpadding='0' cellspacing='0' border='0' style='margin: 0 auto;'>
	                            <tr>
		                            <td>
			                            <table cellpadding='0' cellspacing='0' class='table-row'>
				                            <tr>
					                            <td colspan='3' align='center' style='padding-top: 10px; background-color: white; text-align: left; font-size: 12px; line-height: 18px; mso-line-height-rule: exactly;'>
                                                    <div style='font-size: 18px; line-height: 16px; mso-line-height-rule: exactly; font-weight: bold;'>&nbsp;</div>
						                            <span>
							                            {giverName},
						                            </span>
						                            <div style='font-size: 16px; line-height: 16px; mso-line-height-rule: exactly;'>&nbsp;</div>
						                            <span>
							                            This year your Skinner Secret Santa is:
						                            </span>
						                            <div style='font-size: 14px; line-height: 14px; mso-line-height-rule: exactly;'>&nbsp;</div>
						                            <span style='font-size: 22px; line-height: 30px; mso-line-height-rule: exactly;'>
							                            <b>{receiverName}</b>
						                            </span>
						                            <div style='font-size: 14px; line-height: 14px; mso-line-height-rule: exactly;'>&nbsp;</div>
						                            <span>
							                            Here is their response to the questionaire:
						                            </span>";

            result += $@"<p style='margin 0 !important;'>How do you measure?</p>
						<ul style='margin 0: !important;'>
							<li>Pant Size: {giftSuggestions.PantSize}</li>
							<li>Shirt Size: {giftSuggestions.ShirtSize}</li>
							<li>Shoe Size: {giftSuggestions.ShoeSize}</li>
						</ul>";

            result += @"<p style='margin 0 !important;'>Whats on your wishlist?</p>
						<ul style='margin 0: !important;'>";

            foreach (var item in giftSuggestions.FavoriteThings)
            {
                result += $@"<li>
                                {item.Name} ({item.Description})<br/>
								<a href='{item.Url}'>{item.Url}</a>
                             </li>";
            }

            result += "</ul>";

            result += @"<p style='margin 0 !important;'>Do not buy:</p>
						<ul style='margin 0: !important;'>";

            foreach (var item in giftSuggestions.DoNotBuy)
            {
                result += $@"<li>{item}</li>";
            }

            result += "</ul>";

            result += @"<p style='margin 0 !important;'>Spouse Suggestions:</p>
						<ul style='margin 0: !important;'>";

            foreach (var item in giftSuggestions.SpouseSuggestion)
            {
                result += $@"<li>
								{item.Name} ({item.Description})<br/>
								<a href='{item.Url}'>{item.Url}</a>
                             </li>";
            }

            result += @"<span>
							            Rules:
						            </span>
						            <ul style='margin: 0 !important;'>
							            <li>$200 budget (quantity varies)</li>
							            <li>One surprise item must be included--you choose how much of the budget to dedicate to it</li>
							            <li>If you somehow end up paired with the same person as last year or your significant other, tell Mike and we’ll re-shuffle.</li>
							            <li>Try your best to get your presents to the location of your Secret Santa by Christmas Eve. </li>
							            <li>If you're mailing your presents, try to keep packaging anonymous</li>
							            <li>To maintain the integrity of Secret Santa please keep collusion to a minimum.</li>
							            <li>Only buy presents for the person you're matched with--it's a Secret Santa after all. Kids play by a very different set of rules :)</li>
							            <li>Oh, and have fun!</li>
						            </ul>
						            <div style='font-size: 16px; line-height: 16px; mso-line-height-rule: exactly;'>&nbsp;</div>
					            </td>
				            </tr>
				            <tr>
				            <td colspan='3' style='padding: 8px; line-height: 1.42857143; vertical-align: top;'>

				            </td>
			            </tr>
		            </table>
		            </td>
	            </tr>
            </table>
            </body>
            </html>";

            return result;
        }
    }
}
