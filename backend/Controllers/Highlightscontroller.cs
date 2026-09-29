using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/highlights")]
public class HighlightsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public HighlightsController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    // GET /api/highlights?home=Arsenal&away=Chelsea&year=2026
    [HttpGet]
    public async Task<IActionResult> GetHighlight(
        [FromQuery] string home,
        [FromQuery] string away,
        [FromQuery] string year)
    {
        // La clé est lue ici, côté serveur uniquement — jamais envoyée au navigateur
        var apiKey = _config["YouTube:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            return Problem("Clé API YouTube non configurée côté serveur.", statusCode: 500);
        }

        var query = $"Highlights {home} vs {away} {year}";
        var url = "https://www.googleapis.com/youtube/v3/search"
            + $"?part=snippet&q={Uri.EscapeDataString(query)}&type=video&maxResults=1&key={apiKey}";

        var client = _httpClientFactory.CreateClient("YouTube");
        var response = await client.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            return Problem("Erreur lors de l'appel à l'API YouTube.", statusCode: (int)response.StatusCode);
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        var json = await JsonDocument.ParseAsync(stream);

        string? videoId = null;
        if (json.RootElement.TryGetProperty("items", out var items) && items.GetArrayLength() > 0)
        {
            videoId = items[0].GetProperty("id").GetProperty("videoId").GetString();
        }

        return Ok(new { videoId });
    }
}