"""
GitHub Actions용 NBA 데이터 수집 스크립트
매일 자동으로 실행되어 최신 NBA 선수 스탯을 Supabase에 저장합니다.
"""

from nba_api.stats.endpoints import leaguedashplayerstats
import pandas as pd
from datetime import datetime
import time
import os
import sys
from supabase import create_client, Client

# 환경 변수에서 Supabase 정보 가져오기
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# 현재 시즌 설정
CURRENT_SEASON = '2024-25'

def check_env_variables():
    """환경 변수가 올바르게 설정되었는지 확인"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ 오류: SUPABASE_URL 또는 SUPABASE_KEY 환경 변수가 설정되지 않았습니다.")
        print("GitHub Repository Settings > Secrets and variables > Actions에서 설정하세요.")
        sys.exit(1)
    print("✅ 환경 변수 확인 완료")

def fetch_nba_player_stats(season=CURRENT_SEASON, max_players=50):
    """
    NBA 선수들의 시즌 평균 통계를 가져옵니다.
    
    Args:
        season (str): 시즌 (예: '2024-25')
        max_players (int): 가져올 최대 선수 수
    
    Returns:
        pandas.DataFrame: 선수 통계 데이터프레임
    """
    print(f"🏀 NBA {season} 시즌 선수 통계 가져오는 중...")
    print("=" * 80)
    
    try:
        # NBA API에서 선수 통계 가져오기
        player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            season_type_all_star='Regular Season',
            per_mode_detailed='PerGame',
            measure_type_detailed_defense='Base'
        )
        
        # 데이터프레임으로 변환
        df = player_stats.get_data_frames()[0]
        
        # 필요한 컬럼만 선택
        columns_to_keep = [
            'PLAYER_ID', 'PLAYER_NAME', 'TEAM_ABBREVIATION',
            'GP', 'MIN', 'PTS', 'FGM', 'FG_PCT',
            '3PM', 'FT_PCT', 'OREB', 'REB', 'AST',
            'TOV', 'STL', 'BLK', 'DD2', 'TD3'
        ]
        
        df = df[columns_to_keep]
        
        # 최소 10경기 이상 출전한 선수만 선택
        df = df[df['GP'] >= 10]
        
        # 득점순으로 정렬하고 상위 선수만 선택
        df = df.sort_values('PTS', ascending=False).head(max_players)
        
        print(f"✅ {len(df)}명의 선수 데이터 수집 완료")
        print("\n📊 상위 5명 득점자:")
        for idx, row in df.head(5).iterrows():
            print(f"  {row['PLAYER_NAME']:25} | {row['TEAM_ABBREVIATION']:5} | {row['PTS']:.1f} PPG")
        print()
        
        return df
        
    except Exception as e:
        print(f"❌ NBA API 오류: {str(e)}")
        sys.exit(1)

def save_to_supabase(df, season=CURRENT_SEASON):
    """
    선수 통계를 Supabase에 저장합니다.
    
    Args:
        df (pandas.DataFrame): 선수 통계 데이터프레임
        season (str): 시즌
    """
    print(f"💾 Supabase에 데이터 저장 중...")
    print("=" * 80)
    
    try:
        # Supabase 클라이언트 생성
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase 연결 성공")
        
        players_saved = 0
        stats_saved = 0
        
        for idx, row in df.iterrows():
            try:
                # 1. 선수 정보 저장/업데이트 (nba_players)
                player_api_id = f"nba_{row['PLAYER_ID']}"
                
                player_data = {
                    'player_id': player_api_id,
                    'name': row['PLAYER_NAME'],
                    'team': row['TEAM_ABBREVIATION'],
                    'position': 'F',  # NBA API에서 position이 없으므로 기본값
                    'updated_at': datetime.now().isoformat()
                }
                
                result = supabase.table('nba_players').upsert(
                    player_data,
                    on_conflict='player_id'
                ).execute()
                
                if result.data:
                    player_uuid = result.data[0]['id']
                    players_saved += 1
                else:
                    print(f"⚠️ 선수 저장 실패: {row['PLAYER_NAME']}")
                    continue
                
                # 2. 시즌 평균 스탯 저장 (player_season_stats)
                stats_data = {
                    'player_id': player_uuid,
                    'season': season,
                    'games_played': int(row.get('GP', 0)),
                    'minutes_played': float(row.get('MIN', 0)),
                    'points': float(row.get('PTS', 0)),
                    'field_goals_made': float(row.get('FGM', 0)),
                    'field_goal_percentage': float(row.get('FG_PCT', 0)) * 100,
                    'three_pointers_made': float(row.get('3PM', 0)),
                    'free_throw_percentage': float(row.get('FT_PCT', 0)) * 100 if pd.notna(row.get('FT_PCT')) else 0,
                    'offensive_rebounds': float(row.get('OREB', 0)),
                    'rebounds': float(row.get('REB', 0)),
                    'assists': float(row.get('AST', 0)),
                    'turnovers': float(row.get('TOV', 0)),
                    'steals': float(row.get('STL', 0)),
                    'blocks': float(row.get('BLK', 0)),
                    'double_doubles': int(row.get('DD2', 0)),
                    'triple_doubles': int(row.get('TD3', 0)),
                    'updated_at': datetime.now().isoformat()
                }
                
                supabase.table('player_season_stats').upsert(
                    stats_data,
                    on_conflict='player_id,season'
                ).execute()
                
                stats_saved += 1
                
                # API 제한 방지를 위한 지연
                time.sleep(0.1)
                
            except Exception as e:
                print(f"⚠️ {row['PLAYER_NAME']} 저장 중 오류: {str(e)}")
                continue
        
        print(f"\n✅ {players_saved}명의 선수 정보 저장 완료")
        print(f"✅ {stats_saved}명의 시즌 스탯 저장 완료")
        print(f"📅 시즌: {season}")
        print(f"⏰ 업데이트 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"❌ Supabase 저장 오류: {str(e)}")
        sys.exit(1)

def main():
    """메인 실행 함수"""
    print("\n" + "=" * 80)
    print("🏀 NBA 데이터 자동 수집 시작")
    print(f"⏰ 실행 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")
    
    # 1. 환경 변수 확인
    check_env_variables()
    
    # 2. NBA 데이터 수집
    df = fetch_nba_player_stats(season=CURRENT_SEASON, max_players=50)
    
    # 3. Supabase에 저장
    save_to_supabase(df, season=CURRENT_SEASON)
    
    print("\n" + "=" * 80)
    print("🎉 NBA 데이터 수집 및 저장 완료!")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
