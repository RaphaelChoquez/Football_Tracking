using Microsoft.AspNetCore.Mvc;

namespace Football_Tracking.Controllers
{
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
        public async Task<IActionResult> GetMatches()
        {
            try
            {
                var response = await _httpClient.GetAsync("v4/competitions/PL/matches?status=SCHEDULED");
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, "Erreur lors de la récupération des matchs.");
                }

                var content = await response.Content.ReadAsStringAsync();
                return Content(content, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}