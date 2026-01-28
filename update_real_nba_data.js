// 실제 NBA API에서 2025-26 시즌 현재 데이터 가져오기
const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)[1];
const SUPABASE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1] || 
                      envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/)[1];

console.log('🏀 NBA 2025-26 시즌 실제 데이터 수집 시작...\n');

// NBA API에서 현재 시즌 데이터 가져오기 (nba_api 라이브러리 대신 직접 호출)
function getNBAData() {
  return new Promise((resolve, reject) => {
    // NBA Stats API - 2025-26 시즌
    const options = {
      hostname: 'stats.nba.com',
      path: '/stats/leaguedashplayerstats?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2024-25&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight=',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'x-nba-stats-origin': 'stats.nba.com',
        'x-nba-stats-token': 'true',
        'Referer': 'https://stats.nba.com/',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            reject(new Error('JSON 파싱 실패: ' + e.message));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('요청 시간 초과'));
    });
    req.end();
  });
}

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

async function updateNBAData() {
  try {
    console.log('📡 NBA Stats API 호출 중...');
    console.log('시즌: 2024-25 (현재 실제 진행 중인 시즌)');
    console.log('');

    const nbaData = await getNBAData();
    
    if (!nbaData.resultSets || !nbaData.resultSets[0]) {
      throw new Error('NBA API 응답 형식이 올바르지 않습니다');
    }

    const headers = nbaData.resultSets[0].headers;
    const rows = nbaData.resultSets[0].rowSet;

    console.log(`✅ ${rows.length}명의 선수 데이터 수신 완료!\n`);

    // 인덱스 매핑
    const idxMap = {
      PLAYER_ID: headers.indexOf('PLAYER_ID'),
      PLAYER_NAME: headers.indexOf('PLAYER_NAME'),
      TEAM_ABBREVIATION: headers.indexOf('TEAM_ABBREVIATION'),
      GP: headers.indexOf('GP'),
      MIN: headers.indexOf('MIN'),
      PTS: headers.indexOf('PTS'),
      REB: headers.indexOf('REB'),
      AST: headers.indexOf('AST'),
      STL: headers.indexOf('STL'),
      BLK: headers.indexOf('BLK'),
      TOV: headers.indexOf('TOV'),
      FGM: headers.indexOf('FGM'),
      FG_PCT: headers.indexOf('FG_PCT'),
      FG3M: headers.indexOf('FG3M'),
      FT_PCT: headers.indexOf('FT_PCT'),
      OREB: headers.indexOf('OREB'),
    };

    // 상위 50명만 선택 (득점 순)
    const topPlayers = rows
      .filter(row => row[idxMap.GP] >= 10) // 최소 10경기 이상 출전
      .sort((a, b) => b[idxMap.PTS] - a[idxMap.PTS])
      .slice(0, 50);

    console.log(`📊 상위 50명 선수 선택 (10경기 이상 출전)\n`);

    // 1. 선수 데이터 삽입
    console.log('✅ 선수 정보 업데이트 중...');
    const players = topPlayers.map(row => ({
      player_id: `nba_${row[idxMap.PLAYER_ID]}`,
      name: row[idxMap.PLAYER_NAME],
      team: row[idxMap.TEAM_ABBREVIATION],
      position: 'F', // NBA API에서 position이 제공되지 않으므로 기본값
    }));

    await supabaseRequest('POST', '/rest/v1/nba_players', players);
    console.log(`✅ ${players.length}명의 선수 정보 업데이트 완료!\n`);

    // 2. 선수 ID 조회
    console.log('🔍 선수 ID 조회 중...');
    const playerIds = await supabaseRequest('GET', '/rest/v1/nba_players?select=id,player_id,name');
    const playerIdMap = {};
    playerIds.forEach(p => {
      playerIdMap[p.player_id] = p.id;
    });

    // 3. 시즌 스탯 업데이트
    console.log('✅ 2025-26 시즌 스탯 업데이트 중...');
    const seasonStats = topPlayers.map(row => {
      const playerId = `nba_${row[idxMap.PLAYER_ID]}`;
      const uuid = playerIdMap[playerId];
      if (!uuid) return null;

      return {
        player_id: uuid,
        season: '2024-25',
        games_played: row[idxMap.GP] || 0,
        minutes_played: row[idxMap.MIN] || 0,
        points: row[idxMap.PTS] || 0,
        field_goals_made: row[idxMap.FGM] || 0,
        field_goal_percentage: (row[idxMap.FG_PCT] || 0) * 100,
        three_pointers_made: row[idxMap.FG3M] || 0,
        free_throw_percentage: (row[idxMap.FT_PCT] || 0) * 100,
        offensive_rebounds: row[idxMap.OREB] || 0,
        rebounds: row[idxMap.REB] || 0,
        assists: row[idxMap.AST] || 0,
        turnovers: row[idxMap.TOV] || 0,
        steals: row[idxMap.STL] || 0,
        blocks: row[idxMap.BLK] || 0,
        double_doubles: 0, // 계산 필요
        triple_doubles: 0, // 계산 필요
      };
    }).filter(Boolean);

    await supabaseRequest('POST', '/rest/v1/player_season_stats', seasonStats);
    console.log(`✅ ${seasonStats.length}명의 시즌 스탯 업데이트 완료!\n`);

    // 4. 결과 확인
    const results = await supabaseRequest('GET', '/rest/v1/player_season_stats?season=eq.2024-25&select=*,nba_players(name,team)&order=points.desc&limit=10');
    
    console.log('🎉 2024-25 시즌 실제 데이터 업데이트 완료!\n');
    console.log('📊 상위 10명 선수:');
    console.log('='.repeat(80));
    results.forEach((stat, index) => {
      const player = stat.nba_players;
      console.log(`${(index + 1).toString().padStart(2)}. ${player.name.padEnd(25)} | ${player.team.padEnd(5)} | ${stat.points.toFixed(1).padStart(5)} PPG | ${stat.games_played}경기`);
    });
    console.log('='.repeat(80));
    console.log('\n✨ 완료! 웹사이트를 새로고침하세요:\n');
    console.log('🌐 https://chatbot-phi-amber-51.vercel.app\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('\n💡 가능한 원인:');
    console.error('1. NBA Stats API 접근 제한 (IP 차단 또는 Rate Limit)');
    console.error('2. 2025-26 시즌이 아직 시작되지 않았을 수 있음');
    console.error('3. 네트워크 연결 문제');
    console.error('\n📝 대안:');
    console.error('- 현재 진행 중인 시즌이 2024-25라면 스크립트의 Season 파라미터를 수정해야 합니다.');
    console.error('- 또는 Python 스크립트 (fetch_nba_stats.py)를 사용하세요.');
  }
}

updateNBAData();
