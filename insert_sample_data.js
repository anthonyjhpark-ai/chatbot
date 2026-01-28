// Supabase REST API로 NBA 데이터 삽입 (스키마에 맞게 수정)
const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)[1];
const SUPABASE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1] || 
                      envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/)[1];

console.log('🏀 NBA 선수 데이터 삽입 시작...\n');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Using Service Role Key:', SUPABASE_KEY ? 'Yes' : 'No');
console.log('');

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
        'Prefer': 'return=representation,resolution=merge-duplicates'
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

async function insertData() {
  try {
    // 1. 선수 데이터 삽입
    const players = [
      { player_id: 'nba_lebron_james', name: 'LeBron James', team: 'LAL', position: 'F' },
      { player_id: 'nba_stephen_curry', name: 'Stephen Curry', team: 'GSW', position: 'G' },
      { player_id: 'nba_kevin_durant', name: 'Kevin Durant', team: 'PHX', position: 'F' },
      { player_id: 'nba_giannis', name: 'Giannis Antetokounmpo', team: 'MIL', position: 'F' },
      { player_id: 'nba_luka_doncic', name: 'Luka Doncic', team: 'DAL', position: 'G' },
      { player_id: 'nba_nikola_jokic', name: 'Nikola Jokic', team: 'DEN', position: 'C' },
      { player_id: 'nba_joel_embiid', name: 'Joel Embiid', team: 'PHI', position: 'C' },
      { player_id: 'nba_jayson_tatum', name: 'Jayson Tatum', team: 'BOS', position: 'F' },
      { player_id: 'nba_damian_lillard', name: 'Damian Lillard', team: 'MIL', position: 'G' },
      { player_id: 'nba_anthony_davis', name: 'Anthony Davis', team: 'LAL', position: 'F-C' },
    ];

    console.log('✅ 선수 정보 삽입 중...');
    const insertedPlayers = await supabaseRequest('POST', '/rest/v1/nba_players', players);
    console.log(`✅ ${insertedPlayers.length}명의 선수 삽입 완료!\n`);

    // 2. 선수 ID 조회 (방금 삽입한 선수들)
    console.log('🔍 선수 ID 조회 중...');
    const playerIds = await supabaseRequest('GET', '/rest/v1/nba_players?select=id,player_id,name');
    console.log(`✅ ${playerIds.length}명의 선수 ID 조회 완료!\n`);

    // 3. 스탯 데이터 매핑
    const statsMapping = {
      'LeBron James': { pts: 25.7, fgm: 9.5, fg_pct: 50.3, threes: 2.1, ft_pct: 75.2, reb: 7.3, ast: 7.3, stl: 1.3, blk: 0.6, dd: 15, td: 2 },
      'Stephen Curry': { pts: 29.8, fgm: 10.2, fg_pct: 45.7, threes: 5.2, ft_pct: 92.3, reb: 5.8, ast: 6.5, stl: 1.6, blk: 0.4, dd: 8, td: 0 },
      'Kevin Durant': { pts: 27.1, fgm: 9.8, fg_pct: 52.3, threes: 1.8, ft_pct: 88.9, reb: 6.7, ast: 5.0, stl: 0.9, blk: 1.2, dd: 12, td: 0 },
      'Giannis Antetokounmpo': { pts: 30.4, fgm: 11.3, fg_pct: 54.7, threes: 0.8, ft_pct: 65.7, reb: 11.5, ast: 5.8, stl: 1.2, blk: 1.4, dd: 45, td: 5 },
      'Luka Doncic': { pts: 28.9, fgm: 10.1, fg_pct: 48.8, threes: 3.1, ft_pct: 78.6, reb: 8.8, ast: 8.0, stl: 1.4, blk: 0.5, dd: 35, td: 8 },
      'Nikola Jokic': { pts: 26.4, fgm: 10.0, fg_pct: 58.3, threes: 1.2, ft_pct: 82.2, reb: 12.4, ast: 9.0, stl: 1.3, blk: 0.7, dd: 50, td: 12 },
      'Joel Embiid': { pts: 33.1, fgm: 11.0, fg_pct: 54.8, threes: 1.0, ft_pct: 85.7, reb: 10.2, ast: 4.2, stl: 1.0, blk: 1.7, dd: 40, td: 1 },
      'Jayson Tatum': { pts: 26.9, fgm: 9.6, fg_pct: 46.6, threes: 3.2, ft_pct: 85.4, reb: 8.1, ast: 4.6, stl: 1.1, blk: 0.7, dd: 22, td: 0 },
      'Damian Lillard': { pts: 24.3, fgm: 8.8, fg_pct: 42.9, threes: 3.8, ft_pct: 91.8, reb: 4.4, ast: 7.0, stl: 1.0, blk: 0.4, dd: 5, td: 0 },
      'Anthony Davis': { pts: 24.7, fgm: 9.1, fg_pct: 55.6, threes: 0.8, ft_pct: 81.6, reb: 12.6, ast: 3.5, stl: 1.1, blk: 2.3, dd: 38, td: 2 },
    };

    console.log('✅ 시즌 스탯 삽입 중...');
    const seasonStats = playerIds.map(player => {
      const stats = statsMapping[player.name];
      if (!stats) return null;
      return {
        player_id: player.id,
        season: '2025-26',
        games_played: 65,
        minutes_played: 35.5,
        points: stats.pts,
        field_goals_made: stats.fgm,
        field_goal_percentage: stats.fg_pct,
        three_pointers_made: stats.threes,
        free_throw_percentage: stats.ft_pct,
        offensive_rebounds: 1.2,
        rebounds: stats.reb,
        assists: stats.ast,
        turnovers: 2.8,
        steals: stats.stl,
        blocks: stats.blk,
        double_doubles: stats.dd,
        triple_doubles: stats.td,
      };
    }).filter(Boolean);

    const insertedStats = await supabaseRequest('POST', '/rest/v1/player_season_stats', seasonStats);
    console.log(`✅ ${insertedStats.length}명의 시즌 스탯 삽입 완료!\n`);

    // 4. 결과 확인
    const results = await supabaseRequest('GET', '/rest/v1/player_season_stats?season=eq.2025-26&select=*,nba_players(name,team,position)&order=points.desc');
    
    console.log('🎉 데이터 삽입 완료!\n');
    console.log('📊 삽입된 선수 목록:');
    console.log('='.repeat(80));
    results.forEach((stat, index) => {
      const player = stat.nba_players;
      console.log(`${(index + 1).toString().padStart(2)}. ${player.name.padEnd(25)} | ${player.team.padEnd(5)} | ${stat.points.toFixed(1).padStart(5)} PPG`);
    });
    console.log('='.repeat(80));
    console.log('\n✨ 완료! 웹사이트를 새로고침하세요:\n');
    console.log('🌐 https://chatbot-phi-amber-51.vercel.app\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('\n💡 해결 방법:');
    console.error('1. Supabase 대시보드에 접속: https://supabase.com/dashboard/project/obgzapfpdiiovyikvmlx');
    console.error('2. SQL Editor로 이동');
    console.error('3. supabase/nba-schema.sql 파일의 내용을 복사해서 실행');
  }
}

insertData();
