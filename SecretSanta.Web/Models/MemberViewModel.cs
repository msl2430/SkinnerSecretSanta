using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SecretSanta.Web.Models
{
    public class MemberViewModel
    {
        public Member Member { get; set; }
        public MemberGiftList GiftList { get; set; }
    }
}