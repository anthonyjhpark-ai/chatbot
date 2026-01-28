// 기존 데이터 확인 및 시즌 업데이트
const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)[1];
const SUPABASE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1] || 
                      envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/)[1];

console.log('🔍 Supabase 데이터 확인 중...\n');

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

async function checkData() {
  try {
    // 1. 선수 수 확인
    const players = await supabaseRequest('GET', '/rest/v1/nba_players?select=id,player_id,name,team');
    console.log(`📊 현재 등록된 선수: ${players.length}명\n`);
    
    if (players.length > 0) {
      console.log('상위 5명:');
      players.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i+1}. ${p.name.padEnd(25)} | ${p.team}`);
      });
      console.log('');
    }

    // 2. 시즌 스탯 확인
    const stats2425 = await supabaseRequest('GET', '/rest/v1/player_season_stats?season=eq.2024-25&select=id');
    const stats2526 = await supabaseRequest('GET', '/rest/v1/player_season_stats?season=eq.2025-26&select=id');
    
    console.log(`📊 2024-25 시즌 데이터: ${stats2425.length}명`);
    console.log(`📊 2025-26 시즌 데이터: ${stats2526.length}명\n`);

    // 3. 최신 데이터 조회 (어떤 시즌이든)
    const latestStats = await supabaseRequest('GET', '/rest/v1/player_season_stats?select=*,nba_players(name,team)&order=points.desc&limit=10');
    
    if (latestStats.length > 0) {
      console.log('📊 현재 최고 득점자 (TOP 10):');
      console.log('='.repeat(80));
      latestStats.forEach((stat, index) => {
        const player = stat.nba_players;
        console.log(`${(index + 1).toString().padStart(2)}. ${player.name.padEnd(25)} | ${player.team.padEnd(5)} | ${stat.points.toFixed(1).padStart(5)} PPG | ${stat.season}`);
      });
      console.log('='.repeat(80));
    }

    // 4. 시즌 변경 제안
    if (stats2526.length > 0 && stats2425.length === 0) {
      console.log('\n💡 제안:');
      console.log('- 현재 2025-26 시즌 데이터가 있습니다.');
      console.log('- 프론트엔드 시즌을 2025-26으로 변경하시겠습니까?');
    } else if (stats2425.length > 0 && stats2526.length === 0) {
      console.log('\n✅ 2024-25 시즌 데이터가 있습니다!');
      console.log('- 웹사이트를 새로고침하면 데이터가 표시됩니다.');
    }

    console.log('\n🌐 웹사이트: https://chatbot-phi-amber-51.vercel.app');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

checkData();
