using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SecretSanta.Web.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Hosting;

namespace SecretSanta.Web.Session
{
	[Serializable]
    public class SessionUser
    {
        public static SessionUser Current => (SessionUser)HttpContext.Current.Session["SessionUser"] ?? (SessionUser)(HttpContext.Current.Session["SessionUser"] = new SessionUser());

        public IList<Member> Members { get; set; }
        public string Email { get; set; }
        public Member User { get; set; }

        public SessionUser()
        {
            using (var file = File.OpenText(HostingEnvironment.MapPath("~/Temp") + "/members.json"))
            using (var reader = new JsonTextReader(file))
            {
                var obj = JToken.ReadFrom(reader);
                Members = obj.ToObject<List<Member>>();
            }
        }
    }
}