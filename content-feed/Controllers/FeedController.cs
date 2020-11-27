namespace content_feed.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;

    [ApiController]
    [Route("[controller]")]
    public class FeedController : ControllerBase
    {
        private readonly ILogger<FeedController> _logger;

        public FeedController(ILogger<FeedController> logger)
        {
            this._logger = logger;
        }

        [HttpGet]
        public IEnumerable<ContentItemModel> Get()
        {
            var rng = new Random();
            return Enumerable.Range(1, 1).Select(index => new ContentItemModel()
                {
                    Id = Guid.NewGuid().ToString(),
                    Link = "https://www.youtube.com/watch?v=uMeR2W19wT0",
                    Type = "youtube"
                })
                .ToArray();
        }
    }
}