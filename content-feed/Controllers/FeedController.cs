namespace content_feed.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ApiController]
    [Route("[controller]/[action]")]
    public class FeedController : ControllerBase
    {
        private readonly ILogger<FeedController> _logger;

        private static readonly List<ContentItemModel> predefined = new List<ContentItemModel>
        {
            new ContentItemModel
            {
                Id = Guid.NewGuid().ToString(),
                Link = "https://www.youtube.com/watch?v=uMeR2W19wT0",
                Type = "youtube"
            },
            new ContentItemModel
            {
                Id = Guid.NewGuid().ToString(),
                Link = "https://coub.com/view/2lr6vd",
                Type = "coub"
            },
            new ContentItemModel
            {
                Id = Guid.NewGuid().ToString(),
                Link = "https://www.youtube.com/watch?v=Y1s_WAxNCCw",
                Type = "youtube"
            },
            new ContentItemModel
            {
                Id = Guid.NewGuid().ToString(),
                Link = "https://www.twitch.tv/just_ns/clip/EnergeticAbstemiousScorpionGingerPower",
                Type = "twitch"
            },
            // new ContentItemModel
            // {
            //     Id = Guid.NewGuid().ToString(),
            //     Link = "https://www.tiktok.com/@prokop_02/video/6897916364305173761",
            //     Type = "tiktok"
            // },
        };

        private static Dictionary<string, ContentItemModel> Items { get; } = Initialize();

        private static Dictionary<string, ContentItemModel> Initialize()
        {
            var predefinedDictionary =
                predefined.ToDictionary(item => item.Link, item => item, StringComparer.OrdinalIgnoreCase);
            string path = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp","build", "static", "images");
            DirectoryInfo dir = new DirectoryInfo(path);

            if (dir.Exists == false)
            {
                dir.Create();
            }
            
            foreach (FileInfo file in dir.EnumerateFiles())
            {
                string link = GetLinkFromFileName(file.Name);
                predefinedDictionary[link] = new ContentItemModel
                {
                    Id = Guid.NewGuid().ToString(),
                    Link = link,
                    Type = "image"
                };
            }

            return predefinedDictionary;
        }

        private static string GetLinkFromFileName(string fileName)
        {
            return $"https://localhost:5001/images/{fileName}";
        }


        public FeedController(ILogger<FeedController> logger)
        {
            this._logger = logger;
        }

        [HttpGet]
        public IEnumerable<ContentItemModel> Get()
        {
            return Items.Values.ToArray();
        }

        [HttpPost]
        public void Add(Dictionary<string, object> body)
        {
            string url = body["url"].ToString();
            if (Items.ContainsKey(url))
            {
                return;
            }
            
            Uri uri = new Uri(url);
            ContentItemModel itemModel = new ContentItemModel
            {
                Id = Guid.NewGuid().ToString(),
                Link = url,
            };
            string host = uri.Host.Replace("www.", "").Replace("clips.", "");
            string itemType;
            switch (host)
            {
                case "youtube.com": 
                    itemType = "youtube"; 
                    break;
                case "coub.com": 
                    itemType = "coub"; 
                    break;
                case "tiktok.com": 
                    itemType = "tiktok"; 
                    break;
                case "twitch.tv": 
                    itemType = "twitch"; 
                    break;
                default: 
                    itemType = "unsupported"; 
                    break;
            }

            itemModel.Type = itemType;
            Items[itemModel.Link] = itemModel;
        }

        [HttpPost]
        public void AddImage([FromForm]IFormFile file)
        {
            string path = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp","build", "images", file.FileName);
            
            if (System.IO.File.Exists(path))
            {
                return;
            }
            
            FileStream createStream = System.IO.File.Create(path);
            file.CopyTo(createStream);
            createStream.Close();
            
            ContentItemModel itemModel = new ContentItemModel
            {
                Id = Guid.NewGuid().ToString(),
                Link = $"https://{this.Request.Host.Value}/images/{file.FileName}",
                Type = "image"
            };

            Items[itemModel.Link] = itemModel;
        }
    }
}