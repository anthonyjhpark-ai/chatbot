"""
GitHub Actions용 NBA 데이터 수집 스크립트
balldontlie API를 사용하여 실제 2025-26 시즌 데이터 수집
"""

import requests
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
print(f"🏀 자동 계산된 현재 NBA 시즌: {CURRENT_SEASON}")

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

def fetch_nba_player_stats(season=CURRENT_SEASON):
    """
    balldontlie API로 NBA 선수 시즌 평균 통계를 가져옵니다.
    
    Args:
        season (str): 시즌 (예: '2025-26')
    
    Returns:
        list: 선수 통계 리스트
    """
    print(f"🏀 NBA {season} 시즌 선수 통계 가져오는 중...")
    print(f"📅 API: balldontlie.io")
    print("=" * 80)
    
    # 시즌 문자열을 연도로 변환 (2025-26 -> 2025)
    season_year = int(season.split('-')[0])
    
    all_players_stats = []
    page = 1
    max_pages = 10  # 최대 10페이지까지만 가져오기 (페이지당 100명)
    
    try:
        while page <= max_pages:
            print(f"📡 페이지 {page} 데이터 가져오는 중...")
            
            # balldontlie API: 2025-26 시즌 평균 데이터
            url = f"https://api.balldontlie.io/v1/season_averages"
            params = {
                'season': season_year,
                'per_page': 100,
                'page': page
            }
            
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                stats = data.get('data', [])
                
                if not stats:
                    print(f"✅ 총 {len(all_players_stats)}명의 선수 데이터 수집 완료")
                    break
                
                all_players_stats.extend(stats)
                print(f"   ✓ {len(stats)}명 추가 (누적: {len(all_players_stats)}명)")
                
                # 다음 페이지가 있는지 확인
                meta = data.get('meta', {})
                if not meta.get('next_page'):
                    print(f"✅ 총 {len(all_players_stats)}명의 선수 데이터 수집 완료")
                    break
                
                page += 1
                time.sleep(0.6)  # Rate limit 방지 (60 requests/minute)
            else:
                print(f"⚠️ API 오류: HTTP {response.status_code}")
                break
        
        if not all_players_stats:
            print("❌ 데이터를 가져올 수 없습니다.")
            return []
        
        # 최소 10경기 이상 출전한 선수만 필터링
        filtered_stats = [s for s in all_players_stats if s.get('games_played', 0) >= 10]
        print(f"🔍 10경기 이상 출전 선수: {len(filtered_stats)}명")
        
        return filtered_stats
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return []

def get_player_details(player_id):
    """
    선수 상세 정보를 가져옵니다 (이름, 팀 등)
    
    Args:
        player_id (int): 선수 ID
    
    Returns:
        dict: 선수 정보
    """
    try:
        url = f"https://api.balldontlie.io/v1/players/{player_id}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            return response.json().get('data', {})
        else:
            return None
    except:
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
                player_id = stat.get('player_id')
                
                # 선수 상세 정보 가져오기
                player_info = get_player_details(player_id)
                
                if not player_info:
                    print(f"⚠️ 선수 ID {player_id} 정보를 가져올 수 없습니다.")
                    error_count += 1
                    continue
                
                player_name = f"{player_info.get('first_name', '')} {player_info.get('last_name', '')}".strip()
                team = player_info.get('team', {}).get('abbreviation', 'N/A')
                
                # nba_players 테이블에 선수 정보 저장
                player_data = {
                    'player_id': f"balldontlie_{player_id}",
                    'name': player_name,
                    'team': team
                }
                
                supabase.table('nba_players').upsert(player_data).execute()
                
                # player_season_stats 테이블에 시즌 통계 저장
                stats_data = {
                    'player_id': f"balldontlie_{player_id}",
                    'season': season,
                    'games_played': int(stat.get('games_played', 0)),
                    'minutes_per_game': float(stat.get('min', '0').replace(':', '.') if ':' in str(stat.get('min', '0')) else stat.get('min', 0)),
                    'points': float(stat.get('pts', 0)),
                    'field_goals_made': float(stat.get('fgm', 0)),
                    'field_goal_percentage': float(stat.get('fg_pct', 0)) * 100,
                    'three_pointers_made': float(stat.get('fg3m', 0)),
                    'free_throw_percentage': float(stat.get('ft_pct', 0)) * 100,
                    'offensive_rebounds': float(stat.get('oreb', 0)),
                    'rebounds': float(stat.get('reb', 0)),
                    'assists': float(stat.get('ast', 0)),
                    'turnovers': float(stat.get('turnover', 0)),
                    'steals': float(stat.get('stl', 0)),
                    'blocks': float(stat.get('blk', 0)),
                    'double_doubles': 0,  # balldontlie API에서는 제공하지 않음
                    'triple_doubles': 0   # balldontlie API에서는 제공하지 않음
                }
                
                supabase.table('player_season_stats').upsert(stats_data).execute()
                
                saved_count += 1
                
                if saved_count % 10 == 0:
                    print(f"  ✓ {saved_count}/{len(stats_list)} 저장 완료...")
                
                # Rate limit 방지
                time.sleep(0.6)
                
            except Exception as e:
                error_count += 1
                print(f"⚠️ 선수 ID {stat.get('player_id')} 저장 실패: {e}")
                continue
        
        print("\n" + "=" * 80)
        print(f"✅ 저장 완료: {saved_count}명")
        if error_count > 0:
            print(f"⚠️ 실패: {error_count}명")
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
    
    # 2. NBA 데이터 가져오기
    stats_list = fetch_nba_player_stats()
    
    if not stats_list:
        print("❌ 데이터 수집 실패")
        sys.exit(1)
    
    # 3. Supabase에 저장
    save_to_supabase(stats_list)
    
    print("\n" + "=" * 80)
    print("🎉 모든 작업 완료!")
    print(f"⏰ 종료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
