var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/", () => "API is working!");
app.MapPost("/api/test", () => new { message = "Test endpoint working" });

app.Run("http://localhost:5000");
