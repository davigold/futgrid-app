const fs = require('fs');
const path = require('path');

const url = 'https://v3.football.api-sports.io';

async function fetchApi(endpoint) {
    const apiKey = process.env.API_FOOTBALL_KEY;
    const response = await fetch(`${url}${endpoint}`, {
        headers: {
            'x-apisports-key': apiKey,
        }
    });
    const data = await response.json();
    
    // Fallback for RapidAPI if needed
    if (data.errors && (data.errors.token || data.message === "You are not subscribed to this API.")) {
        const rapidResponse = await fetch(`https://api-football-v1.p.rapidapi.com/v3${endpoint}`, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
            }
        });
        return rapidResponse.json();
    }
    
    return data;
}

async function run() {
    console.log("🔍 Buscando ID da Liga (Brasileirão Série A)...");
    const leaguesData = await fetchApi('/leagues?search=Serie A');
    
    if (!leaguesData.response || leaguesData.response.length === 0) {
        console.error("❌ Liga não encontrada.");
        console.log(JSON.stringify(leaguesData));
        return;
    }

    // A Serie A costuma ser a primeira ou única retornada na busca exata
    const serieA = leaguesData.response.find(l => l.country.name === 'Brazil').league;
    const leagueId = serieA.id;
    console.log(`✅ Liga encontrada: ${serieA.name} (ID: ${leagueId})`);

    const season = 2023; // 2023 é a temporada mais completa e estável na API para dados consolidados agora.
    console.log(`🔍 Buscando 3 páginas de jogadores da temporada ${season}...`);
    
    let allPlayers = [];
    
    // Fetch 3 pages (aprox 60 jogadores) - Custa apenas 3 requisições
    for (let page = 1; page <= 3; page++) {
        const playersData = await fetchApi(`/players?league=${leagueId}&season=${season}&page=${page}`);
        if (playersData.response) {
            allPlayers = allPlayers.concat(playersData.response);
            console.log(`✅ Página ${page} extraída com sucesso (${playersData.response.length} jogadores)`);
        } else {
            console.error(`❌ Erro na página ${page}:`, playersData);
        }
    }

    const outputPath = path.join(__dirname, 'src', 'data', 'mockPlayers.json');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, JSON.stringify(allPlayers, null, 2));
    console.log(`🎉 Sucesso Absoluto! ${allPlayers.length} jogadores e seus históricos salvos em ${outputPath}`);
}

run();
