using System;
using System.Collections.Generic;

namespace SecretSanta.Web.Models
{
	[Serializable]
	public class Member
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public IList<int> Ineligible { get; set; }
		public string Email { get; set; }
		
		public Member()
		{
			Ineligible = new List<int>();
		}
	}

	[Serializable]
	public class MemberGiftList
	{
		public int Id { get; set; }
		public int Year { get; set; }
		public string PantSize { get; set; }
		public string ShirtSize { get; set; }
		public string ShoeSize { get; set; }
		public IList<GiftItem> FavoriteThings { get; set; }
		public IList<GiftItem> SpouseSuggestion { get; set; }
		public IList<string> DoNotBuy { get; set; }

		public MemberGiftList()
		{
			FavoriteThings = new List<GiftItem>();
			DoNotBuy = new List<string>();
			SpouseSuggestion = new List<GiftItem>();
			PantSize = ShirtSize = ShoeSize = string.Empty;
		}

		public MemberGiftList(int id, int year)
		{
			Id = id;
			Year = year;
			FavoriteThings = new List<GiftItem>();
			DoNotBuy = new List<string>();
			SpouseSuggestion = new List<GiftItem>();
			PantSize = ShirtSize = ShoeSize= string.Empty;
		}
	}
}