// 2025-26 데이터를 2024-25로 업데이트
const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)[1];
const SUPABASE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1] || 
                      envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/)[1];

console.log('🔄 시즌 데이터 업데이트: 2025-26 → 2024-25\n');

function supabaseRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : []);
          } catch(e) {
            resolve([]);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function updateSeason() {
  try {
    // 1. 2025-26 시즌 데이터 조회
    console.log('📊 2025-26 시즌 데이터 조회 중...');
    const oldStats = await supabaseRequest('GET', '/rest/v1/player_season_stats?season=eq.2025-26&select=id,player_id');
    console.log(`✅ ${oldStats.length}명의 데이터 발견\n`);

    if (oldStats.length === 0) {
      console.log('⚠️ 업데이트할 데이터가 없습니다.');
      return;
    }

    // 2. 각 레코드를 2024-25로 업데이트
    console.log('🔄 시즌을 2024-25로 업데이트 중...');
    let updated = 0;

    for (const stat of oldStats) {
      try {
        await supabaseRequest(
          'PATCH',
          `/rest/v1/player_season_stats?id=eq.${stat.id}`,
          { season: '2024-25' }
        );
        updated++;
        if (updated % 5 === 0) {
          process.stdout.write(`  ${updated}/${oldStats.length} 완료...\r`);
        }
      } catch (e) {
        console.error(`\n⚠️ ID ${stat.id} 업데이트 실패:`, e.message);
      }
    }

    console.log(`\n✅ ${updated}명의 시즌 데이터 업데이트 완료!\n`);

    // 3. 결과 확인
    const newStats = await supabaseRequest('GET', '/rest/v1/player_season_stats?season=eq.2024-25&select=*,nba_players(name,team)&order=points.desc&limit=10');
    
    console.log('📊 업데이트된 데이터 (TOP 10):');
    console.log('='.repeat(80));
    newStats.forEach((stat, index) => {
      const player = stat.nba_players;
      console.log(`${(index + 1).toString().padStart(2)}. ${player.name.padEnd(25)} | ${player.team.padEnd(5)} | ${stat.points.toFixed(1).padStart(5)} PPG | ${stat.season}`);
    });
    console.log('='.repeat(80));

    console.log('\n✨ 완료! 웹사이트를 새로고침하세요:');
    console.log('🌐 https://chatbot-phi-amber-51.vercel.app\n');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

updateSeason();
