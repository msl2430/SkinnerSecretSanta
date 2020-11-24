using System;

namespace SecretSanta.Web.Models
{
	[Serializable]
	public class GiftItem
	{
		public string Name { get; set; }
		public string Description { get; set; }
		public string Url { get; set; }
	}
}