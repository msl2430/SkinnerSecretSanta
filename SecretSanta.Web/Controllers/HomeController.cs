using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SecretSanta.Web.Models;
using SecretSanta.Web.Session;

namespace SecretSanta.Web.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        [Route("")]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [Route("~/login")]
        public ActionResult Login(string email)
        {
            if(SessionUser.Current.Members.All(m => m.Email != email))
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden);

            var user = SessionUser.Current.Members.FirstOrDefault(m => m.Email == email);

            if(user == null)
                return new HttpStatusCodeResult(HttpStatusCode.Forbidden);

            SessionUser.Current.User = user;
            SessionUser.Current.Email = email;
            MemberGiftList giftList = null;
            var directory = new DirectoryInfo(HostingEnvironment.MapPath("~/Temp"));
            if (directory.GetFiles($"{user.Id}_{DateTime.Now.Year}.json").ToList().Count <= 0)
            {
                giftList = new MemberGiftList(user.Id, DateTime.UtcNow.Year);
                var export = JsonConvert.SerializeObject(giftList);
                System.IO.File.WriteAllText(HostingEnvironment.MapPath("~/Temp") + $"/{user.Id}_{DateTime.Now.Year}.json", export);
            }
            else
            {
                using (var file = System.IO.File.OpenText(HostingEnvironment.MapPath("~/Temp") + $"/{user.Id}_{DateTime.Now.Year}.json"))
                using (var reader = new JsonTextReader(file))
                {
                    var obj = JToken.ReadFrom(reader);
                    giftList = obj.ToObject<MemberGiftList>();
                }
            }

            return Json(new MemberViewModel
            {
                Member =  user,
                GiftList = giftList
            });
        }

        [HttpPost]
        [Route("Save")]
        public ActionResult Save(MemberGiftList model)
        {
            var export = JsonConvert.SerializeObject(model);
            System.IO.File.WriteAllText(HostingEnvironment.MapPath("~/Temp") + $"/{model.Id}_{DateTime.Now.Year}.json", export);

            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }
    }
}