using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Configure to run on port 5000
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Configure form options for file uploads
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

// Database configuration with SQL Server using LocalDB
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer("Server=DESKTOP-ALT95HP\\SQLEXPRESS;Database=AutoLoopDB;Trusted_Connection=True;TrustServerCertificate=True;"));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowEverything", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles(); // Enable static file serving

app.UseRouting();

app.UseCors("AllowEverything");

app.UseAuthorization();

app.MapControllers();


app.Run();
