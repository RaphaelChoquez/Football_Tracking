using Microsoft.AspNetCore.Mvc;

namespace Football_Tracking.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public MatchesController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("FootballData");
    }

    [HttpGet]
    public async Task<IActionResult> GetMatches([FromQuery] string code = "PL")
    {
        try
        {
            // Forcer l'utilisation de la ligue reçue en paramètre
            var leagueCode = string.IsNullOrWhiteSpace(code) ? "PL" : code.ToUpper();

            var response = await _httpClient.GetAsync($"v4/competitions/{leagueCode}/matches");

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new { message = $"Erreur API Football-Data ({response.StatusCode})", details = errorBody });
            }

            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}