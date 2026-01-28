"""
GitHub Actions용 NBA 데이터 수집 스크립트
nba_api를 사용하여 실제 2025-26 시즌 데이터 수집 (개선된 버전)
"""

from nba_api.stats.endpoints import leaguedashplayerstats
from nba_api.stats.static import players
import time
import os
import sys
from datetime import datetime
from supabase import create_client, Client

# 환경 변수에서 Supabase 정보 가져오기
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def get_current_nba_season():
    """
    현재 날짜를 기준으로 NBA 시즌 문자열을 자동 생성합니다.
    
    Returns:
        str: 시즌 문자열 (예: '2025-26')
    """
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    if current_month >= 10:
        season = f"{current_year}-{str(current_year + 1)[-2:]}"
    elif current_month <= 6:
        season = f"{current_year - 1}-{str(current_year)[-2:]}"
    else:
        season = f"{current_year}-{str(current_year + 1)[-2:]}"
    
    return season

# 현재 시즌 자동 계산
CURRENT_SEASON = get_current_nba_season()
print(f"🏀 자동 계산된 현재 NBA 시즌: {CURRENT_SEASON}\n")

def check_env_variables():
    """환경 변수가 올바르게 설정되었는지 확인"""
    print("=" * 80)
    print("🔍 환경 변수 확인 중...")
    print("=" * 80)
    
    if not SUPABASE_URL:
        print("❌ 오류: SUPABASE_URL 환경 변수가 설정되지 않았습니다.")
        sys.exit(1)
    
    if not SUPABASE_KEY:
        print("❌ 오류: SUPABASE_KEY 환경 변수가 설정되지 않았습니다.")
        sys.exit(1)
    
    print(f"✅ SUPABASE_URL: {SUPABASE_URL[:30]}...")
    print(f"✅ SUPABASE_KEY: {SUPABASE_KEY[:20]}...")
    print("✅ 환경 변수 확인 완료\n")

def fetch_nba_player_stats_with_retry(season=CURRENT_SEASON, max_retries=3):
    """
    NBA API로 선수 통계를 가져옵니다 (재시도 로직 포함)
    
    Args:
        season (str): 시즌 (예: '2025-26')
        max_retries (int): 최대 재시도 횟수
    
    Returns:
        list: 선수 통계 리스트 또는 None
    """
    print(f"🏀 NBA {season} 시즌 선수 통계 가져오는 중...")
    print(f"📅 시즌 타입: Regular Season (정규 시즌)")
    print("=" * 80)
    
    for attempt in range(1, max_retries + 1):
        try:
            print(f"\n📡 시도 {attempt}/{max_retries}: NBA Stats API 연결 중...")
            
            # NBA API 호출 (timeout 증가, headers 추가)
            stats = leaguedashplayerstats.LeagueDashPlayerStats(
                season=season,
                season_type_all_star='Regular Season',
                per_mode_detailed='PerGame',
                timeout=180,  # 3분으로 증가
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.nba.com/'
                }
            )
            
            print("⏳ 데이터 변환 중...")
            df = stats.get_data_frames()[0]
            
            # 최소 10경기 이상 출전한 선수만 필터링
            df = df[df['GP'] >= 10]
            
            # 득점 순으로 정렬
            df = df.sort_values('PTS', ascending=False)
            
            print(f"✅ {len(df)}명의 선수 데이터 수집 성공!")
            
            # DataFrame을 dict 리스트로 변환
            return df.to_dict('records')
            
        except Exception as e:
            print(f"❌ 시도 {attempt} 실패: {str(e)[:100]}")
            
            if attempt < max_retries:
                wait_time = 10 * attempt  # 점진적으로 대기 시간 증가
                print(f"⏳ {wait_time}초 후 재시도...")
                time.sleep(wait_time)
            else:
                print("\n" + "=" * 80)
                print("❌ 모든 재시도 실패")
                print("=" * 80)
                print("\n💡 가능한 원인:")
                print("  1. NBA Stats API 서버 일시적 장애")
                print("  2. GitHub Actions 서버에서 NBA.com 접근 제한")
                print("  3. Rate Limit 초과")
                print("\n💡 해결 방법:")
                print("  1. 몇 시간 후 다시 시도")
                print("  2. 로컬 환경에서 실행 (Windows PowerShell)")
                print("  3. 또는 발급받은 API 키가 필요한 다른 서비스 사용")
                return None
    
    return None

def save_to_supabase(stats_list, season=CURRENT_SEASON):
    """
    선수 통계를 Supabase에 저장합니다.
    
    Args:
        stats_list (list): 선수 통계 리스트
        season (str): 시즌
    """
    if not stats_list:
        print("❌ 저장할 데이터가 없습니다.")
        return
    
    print("\n" + "=" * 80)
    print(f"💾 Supabase에 {len(stats_list)}명의 데이터 저장 중...")
    print("=" * 80)
    
    try:
        # Supabase 클라이언트 초기화
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        saved_count = 0
        error_count = 0
        
        for idx, stat in enumerate(stats_list, 1):
            try:
                player_id = stat.get('PLAYER_ID')
                player_name = stat.get('PLAYER_NAME', 'Unknown')
                team = stat.get('TEAM_ABBREVIATION', 'N/A')
                
                # nba_players 테이블에 선수 정보 저장
                player_data = {
                    'player_id': f"nba_{player_id}",
                    'name': player_name,
                    'team': team
                }
                
                supabase.table('nba_players').upsert(player_data).execute()
                
                # player_season_stats 테이블에 시즌 통계 저장
                stats_data = {
                    'player_id': f"nba_{player_id}",
                    'season': season,
                    'games_played': int(stat.get('GP', 0)),
                    'minutes_per_game': float(stat.get('MIN', 0)),
                    'points': float(stat.get('PTS', 0)),
                    'field_goals_made': float(stat.get('FGM', 0)),
                    'field_goal_percentage': float(stat.get('FG_PCT', 0)) * 100,
                    'three_pointers_made': float(stat.get('FG3M', 0)),
                    'free_throw_percentage': float(stat.get('FT_PCT', 0)) * 100,
                    'offensive_rebounds': float(stat.get('OREB', 0)),
                    'rebounds': float(stat.get('REB', 0)),
                    'assists': float(stat.get('AST', 0)),
                    'turnovers': float(stat.get('TOV', 0)),
                    'steals': float(stat.get('STL', 0)),
                    'blocks': float(stat.get('BLK', 0)),
                    'double_doubles': int(stat.get('DD2', 0)),
                    'triple_doubles': int(stat.get('TD3', 0))
                }
                
                supabase.table('player_season_stats').upsert(stats_data).execute()
                
                saved_count += 1
                
                if saved_count % 20 == 0:
                    print(f"  ✓ {saved_count}/{len(stats_list)} 저장 완료...")
                
            except Exception as e:
                error_count += 1
                print(f"⚠️ {player_name} 저장 실패: {str(e)[:50]}")
                continue
        
        print("\n" + "=" * 80)
        print(f"✅ 저장 완료: {saved_count}명")
        if error_count > 0:
            print(f"⚠️ 실패: {error_count}명")
        print("=" * 80)
        
        # 상위 10명 출력
        print("\n📊 저장된 데이터 (TOP 10):")
        print("=" * 80)
        for i, stat in enumerate(stats_list[:10], 1):
            print(f"{i:2}. {stat.get('PLAYER_NAME', '').ljust(25)} | "
                  f"{stat.get('TEAM_ABBREVIATION', '').ljust(5)} | "
                  f"{stat.get('PTS', 0):5.1f} PPG")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Supabase 저장 오류: {e}")
        sys.exit(1)

def main():
    """메인 실행 함수"""
    print("\n" + "=" * 80)
    print("🏀 NBA 데이터 자동 수집 시작")
    print(f"⏰ 실행 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")
    
    # 1. 환경 변수 확인
    check_env_variables()
    
    # 2. NBA 데이터 가져오기 (재시도 포함)
    stats_list = fetch_nba_player_stats_with_retry()
    
    if not stats_list:
        print("\n⚠️ NBA API에서 데이터를 가져올 수 없습니다.")
        print("💡 대안: 로컬 환경에서 실행해보세요:")
        print("   python fetch_data.py")
        sys.exit(1)
    
    # 3. Supabase에 저장
    save_to_supabase(stats_list)
    
    print("\n" + "=" * 80)
    print("🎉 모든 작업 완료!")
    print(f"⏰ 종료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🌐 웹사이트: https://chatbot-phi-amber-51.vercel.app")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
