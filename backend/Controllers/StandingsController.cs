using Microsoft.AspNetCore.Mvc;

namespace Football_Tracking.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StandingsController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public StandingsController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient("FootballData");
        }

        [HttpGet]
        public async Task<IActionResult> GetStandings()
        {
            try
            {
                // Code compétition Premier League = 2021 ou PL
                var response = await _httpClient.GetAsync("v4/competitions/PL/standings");
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, "Erreur lors de la récupération du classement.");
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