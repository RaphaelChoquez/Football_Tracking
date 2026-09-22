using Microsoft.AspNetCore.Mvc;

namespace Football_Tracking.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public PlayersController(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("FootballData");
    }

    [HttpGet("scorers")]
    public async Task<IActionResult> GetTopScorers([FromQuery] string code = "PL")
    {
        try
        {
            var leagueCode = string.IsNullOrWhiteSpace(code) ? "PL" : code.ToUpper();
            var response = await _httpClient.GetAsync($"v4/competitions/{leagueCode}/scorers?limit=15");

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new { message = "Erreur lors de la récupération des buteurs.", details = error });
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