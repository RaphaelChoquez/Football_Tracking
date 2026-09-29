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

// 3bis. Configurer le HttpClient "YouTube" pour le HighlightsController
//       (la clé est lue ici côté serveur, jamais envoyée au navigateur)
builder.Services.AddHttpClient("YouTube");

// 4. Configuration de CORS pour le frontend Vite
//    On autorise le dev local ET le frontend déployé (Vercel/Netlify/etc.)
//    L'URL de prod vient d'une variable d'environnement pour ne pas la hardcoder.
var frontendProdUrl = builder.Configuration["Frontend:Url"]; // ex: https://ton-projet.vercel.app

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = new List<string> { "http://localhost:5173" };
        if (!string.IsNullOrEmpty(frontendProdUrl))
        {
            origins.Add(frontendProdUrl);
        }

        policy.WithOrigins(origins.ToArray())
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure le pipeline HTTP
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

// 5. Connecter les contrôleurs (StandingsController, MatchesController, HighlightsController...)
app.MapControllers();

app.Run();