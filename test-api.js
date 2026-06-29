const url = 'https://v3.football.api-sports.io/status';

async function testAPI() {
    const apiKey = process.env.API_FOOTBALL_KEY;
    
    if (!apiKey || apiKey.includes("COLE_AQUI")) {
        console.error("ERRO: A chave API_FOOTBALL_KEY não foi encontrada ou ainda está com o valor padrão no .env.local");
        process.exit(1);
    }

    console.log("🔍 Iniciando teste de conexão com API-Football...");
    
    try {
        // Tentativa primária usando o cabeçalho padrão da API-Sports
        const response = await fetch(url, {
            headers: {
                'x-apisports-key': apiKey,
            }
        });
        
        let data = await response.json();
        
        // Se falhar por autenticação, tenta o cabeçalho do RapidAPI
        if (data.errors && (data.errors.token || data.message === "You are not subscribed to this API.")) {
            console.log("⚠️ Chave direta falhou. Tentando como chave do RapidAPI...");
            const rapidResponse = await fetch('https://api-football-v1.p.rapidapi.com/v3/status', {
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
                }
            });
            data = await rapidResponse.json();
        }

        if (data.errors && Object.keys(data.errors).length > 0) {
            console.error("❌ Erro retornado pela API:", data.errors);
        } else {
            console.log("✅ Conexão bem sucedida!");
            console.log("📊 Status da Conta (Plano Atual):");
            console.log(JSON.stringify(data.response, null, 2));
        }

    } catch (e) {
        console.error("❌ Erro fatal ao tentar conectar:", e.message);
    }
}

testAPI();
