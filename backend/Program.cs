var builder = WebApplication.CreateBuilder(args);

// 1. Enregistrer le support des contrôleurs (OBLIGATOIRE avant builder.Build())
builder.Services.AddControllers();

// 2. Enregistrer Swagger et les services de base
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Configurer le HttpClient "FootballData" avec la clé API pour les contrôleurs
var apiKey = builder.Configuration["FootballData:ApiKey"];
builder.Services.AddHttpClient("FootballData", client =>
{
    client.BaseAddress = new Uri("https://api.football-data.org/");
    if (!string.IsNullOrEmpty(apiKey))
    {
        client.DefaultRequestHeaders.Add("X-Auth-Token", apiKey);
    }
});

// 4. Configuration de CORS pour le frontend Vite
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Configure le pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

// 5. Connecter les contrôleurs (StandingsController, MatchesController...)
app.MapControllers();

app.Run();