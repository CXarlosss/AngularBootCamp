# Opciones Completadas

## Opción A: Post de LinkedIn
**Idea de post para anunciar el portfolio y sus proyectos:**

🚀 ¡Hoy marco un hito importante en mi carrera como desarrollador Full Stack!

Durante los últimos meses he estado construyendo no solo aplicaciones, sino un ecosistema completo de herramientas interconectadas. Hoy presento mi nuevo portfolio profesional, donde destaco los 4 proyectos técnicos más desafiantes que he desarrollado:

1️⃣ **FluxForge:** Un orquestador visual de workflows. Desarrollado con React Flow y Fastify, permite ejecutar código no confiable de forma segura (QuickJS sandbox) y exportar nodos a n8n en tiempo real mediante WebSockets.
2️⃣ **CodeSynapse:** Un motor RAG de análisis semántico de código 100% local. Utilizando Xenova Transformers y sqlite-vec en Node.js, permite chatear con repositorios enteros sin enviar propiedad intelectual a la nube.
3️⃣ **AuthForge:** Mi propio Identity Provider (IdP). Implementado con Fastify y SQLite, cuenta con rotación automática de JWT, autenticación 2FA (TOTP compatible con Google Authenticator), OAuth2 con GitHub y control de roles (RBAC). ¡Actualmente es el sistema que protege y da acceso a FluxForge!
4️⃣ **LocalMarket:** Un marketplace moderno enfocado en la performance extrema, construido con Angular 21, Server-Side Rendering (SSR) y optimización agresiva de carga.

Me he enfocado fuertemente en la arquitectura, la seguridad y el rendimiento real. Si te interesa el desarrollo Full Stack, la arquitectura de sistemas o la inteligencia artificial aplicada a herramientas de desarrollo, me encantaría saber qué opinas de los proyectos.

🔗 Echa un vistazo al portfolio interactivo aquí: https://super-portfolio-chi.vercel.app
🔗 Repositorios y código abierto en mi GitHub: https://github.com/CXarlosss

#React #NodeJS #Fastify #Angular #TypeScript #WebSockets #AI #SoftwareArchitecture #FullStackDeveloper

---

## Opción B: Script de Verificación Automatizada (PowerShell)

Guarda este código en un archivo llamado `verify-deployments.ps1` en tu carpeta raíz y ejecútalo para probar rápidamente que todas las APIs y webs están vivas.

```powershell
$endpoints = @(
    @{ Name = "AuthForge API Health"; Url = "https://authforge-api.onrender.com/health"; Type = "JSON" }
    @{ Name = "FluxForge Web"; Url = "https://flux-forge-wine.vercel.app"; Type = "HTML" }
    @{ Name = "CodeSynapse Web"; Url = "https://codesynapse.vercel.app"; Type = "HTML" }
    @{ Name = "Portfolio Web"; Url = "https://super-portfolio-chi.vercel.app"; Type = "HTML" }
)

Write-Host "Iniciando verificación de entornos de producción..." -ForegroundColor Cyan

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method Get -TimeoutSec 15 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] $($endpoint.Name)" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] $($endpoint.Name) respondió con HTTP $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[FAIL] $($endpoint.Name) - Error al conectar: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Verificación finalizada." -ForegroundColor Cyan
```
