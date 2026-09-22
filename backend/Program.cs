var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

var apiKey = builder.Configuration["FootballData:ApiKey"]; 
const string BASE_URL = "https://api.football-data.org/v4";

app.MapGet("/api/matches", async (IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Add("X-Auth-Token", apiKey);

    var response = await client.GetAsync($"{BASE_URL}/competitions/PL/matches?status=SCHEDULED");
    var json = await response.Content.ReadAsStringAsync();

    return Results.Content(json, "application/json");
})
.WithName("GetMatches")
.WithOpenApi();

app.Run();