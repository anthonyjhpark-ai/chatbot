"""
NBA 선수 시즌 통계 수집 스크립트
nba_api를 사용하여 현재 시즌의 모든 선수 평균 통계를 가져옵니다.
Supabase에 데이터를 저장할 수 있습니다.
"""

from nba_api.stats.endpoints import leaguedashplayerstats
from nba_api.stats.static import players
import pandas as pd
from datetime import datetime
import time
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

def fetch_nba_player_stats(season='2025-26'):
    """
    NBA 선수들의 시즌 평균 통계를 가져옵니다.
    
    Args:
        season (str): 시즌 (예: '2025-26')
    
    Returns:
        pandas.DataFrame: 선수 통계 데이터프레임
    """
    print(f"🏀 NBA {season} 시즌 선수 통계를 가져오는 중...")
    print("=" * 80)
    
    try:
        # NBA API에서 선수 통계 가져오기
        # PerMode='PerGame'는 경기당 평균을 의미
        player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            season_type_all_star='Regular Season',
            per_mode_detailed='PerGame',  # 경기당 평균
            measure_type_detailed_defense='Base'
        )
        
        # 데이터프레임으로 변환
        df = player_stats.get_data_frames()[0]
        
        # 필요한 컬럼만 선택
        columns_to_keep = [
            'PLAYER_NAME',      # 선수 이름
            'TEAM_ABBREVIATION', # 팀
            'GP',               # 경기 수
            'MIN',              # 평균 출전 시간
            'PTS',              # 경기당 평균 득점
            'FGM',              # 경기당 평균 야투 성공
            'FG_PCT',           # 야투율
            'FG3M',             # 경기당 평균 3점 성공
            'FG3_PCT',          # 3점슛 성공률
            'FTM',              # 경기당 평균 자유투 성공
            'FT_PCT',           # 자유투율
            'OREB',             # 경기당 평균 공격 리바운드
            'REB',              # 경기당 평균 리바운드
            'AST',              # 경기당 평균 어시스트
            'TOV',              # 경기당 평균 턴오버
            'STL',              # 경기당 평균 스틸
            'BLK',              # 경기당 평균 블록
            'DD2',              # 더블더블 횟수
            'TD3',              # 트리플더블 횟수
        ]
        
        # 존재하는 컬럼만 선택
        available_columns = [col for col in columns_to_keep if col in df.columns]
        df_filtered = df[available_columns].copy()
        
        # 최소 5경기 이상 출전한 선수만 필터링
        df_filtered = df_filtered[df_filtered['GP'] >= 5]
        
        # 득점 순으로 정렬
        df_filtered = df_filtered.sort_values('PTS', ascending=False)
        
        # 인덱스 리셋
        df_filtered = df_filtered.reset_index(drop=True)
        
        print(f"✅ 총 {len(df_filtered)}명의 선수 데이터를 가져왔습니다.")
        print("=" * 80)
        
        return df_filtered
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return None


def display_stats(df, top_n=50):
    """
    선수 통계를 보기 좋게 출력합니다.
    
    Args:
        df (pandas.DataFrame): 선수 통계 데이터프레임
        top_n (int): 상위 몇 명까지 출력할지
    """
    if df is None or df.empty:
        print("표시할 데이터가 없습니다.")
        return
    
    # 컬럼 이름을 한글로 매핑
    column_names = {
        'PLAYER_NAME': '선수명',
        'TEAM_ABBREVIATION': '팀',
        'GP': '경기수',
        'MIN': '출전시간',
        'PTS': '득점',
        'FGM': '야투',
        'FG_PCT': '야투율',
        'FG3M': '3점',
        'FG3_PCT': '3점율',
        'FTM': '자유투',
        'FT_PCT': '자유투율',
        'OREB': '공격REB',
        'REB': '리바운드',
        'AST': '어시스트',
        'TOV': '턴오버',
        'STL': '스틸',
        'BLK': '블록',
        'DD2': 'DD',
        'TD3': 'TD',
    }
    
    # 데이터프레임 복사 및 컬럼명 변경
    df_display = df.head(top_n).copy()
    df_display = df_display.rename(columns=column_names)
    
    # 퍼센트 컬럼을 백분율로 변환
    if '야투율' in df_display.columns:
        df_display['야투율'] = (df_display['야투율'] * 100).round(1)
    if '3점율' in df_display.columns:
        df_display['3점율'] = (df_display['3점율'] * 100).round(1)
    if '자유투율' in df_display.columns:
        df_display['자유투율'] = (df_display['자유투율'] * 100).round(1)
    
    # 소수점 반올림
    numeric_columns = df_display.select_dtypes(include=['float64']).columns
    for col in numeric_columns:
        if col not in ['야투율', '3점율', '자유투율']:
            df_display[col] = df_display[col].round(1)
    
    print(f"\n📊 상위 {top_n}명 선수 통계")
    print("=" * 180)
    
    # pandas 출력 옵션 설정
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 200)
    pd.set_option('display.max_rows', None)
    
    # 테이블 형식으로 출력
    print(df_display.to_string(index=True))
    print("=" * 180)
    
    # 주요 통계
    print(f"\n📈 주요 통계:")
    print(f"   - 최고 득점자: {df.iloc[0]['PLAYER_NAME']} ({df.iloc[0]['PTS']:.1f}점)")
    
    if 'AST' in df.columns:
        top_ast_idx = df['AST'].idxmax()
        print(f"   - 최다 어시스트: {df.loc[top_ast_idx, 'PLAYER_NAME']} ({df.loc[top_ast_idx, 'AST']:.1f}개)")
    
    if 'REB' in df.columns:
        top_reb_idx = df['REB'].idxmax()
        print(f"   - 최다 리바운드: {df.loc[top_reb_idx, 'PLAYER_NAME']} ({df.loc[top_reb_idx, 'REB']:.1f}개)")
    
    if 'BLK' in df.columns:
        top_blk_idx = df['BLK'].idxmax()
        print(f"   - 최다 블록: {df.loc[top_blk_idx, 'PLAYER_NAME']} ({df.loc[top_blk_idx, 'BLK']:.1f}개)")
    
    if 'STL' in df.columns:
        top_stl_idx = df['STL'].idxmax()
        print(f"   - 최다 스틸: {df.loc[top_stl_idx, 'PLAYER_NAME']} ({df.loc[top_stl_idx, 'STL']:.1f}개)")
    
    if 'TD3' in df.columns:
        top_td_idx = df['TD3'].idxmax()
        if df.loc[top_td_idx, 'TD3'] > 0:
            print(f"   - 최다 트리플더블: {df.loc[top_td_idx, 'PLAYER_NAME']} ({int(df.loc[top_td_idx, 'TD3'])}회)")


def save_to_csv(df, filename='nba_player_stats.csv'):
    """
    데이터를 CSV 파일로 저장합니다.
    
    Args:
        df (pandas.DataFrame): 저장할 데이터프레임
        filename (str): 파일명
    """
    if df is None or df.empty:
        print("저장할 데이터가 없습니다.")
        return
    
    try:
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"\n💾 데이터가 '{filename}' 파일로 저장되었습니다.")
    except Exception as e:
        print(f"❌ 파일 저장 실패: {e}")


def get_supabase_client():
    """
    Supabase 클라이언트를 생성합니다.
    
    Returns:
        Client: Supabase 클라이언트 또는 None
    """
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        return None
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        return supabase
    except Exception as e:
        print(f"❌ Supabase 연결 실패: {e}")
        return None


def save_to_supabase(df, season='2025-26'):
    """
    데이터를 Supabase에 저장합니다.
    
    Args:
        df (pandas.DataFrame): 저장할 데이터프레임
        season (str): 시즌
    
    Returns:
        bool: 성공 여부
    """
    if df is None or df.empty:
        print("저장할 데이터가 없습니다.")
        return False
    
    print(f"\n📤 Supabase에 데이터를 업로드하는 중...")
    print("=" * 80)
    
    # Supabase 클라이언트 생성
    supabase = get_supabase_client()
    if supabase is None:
        print("❌ Supabase 설정이 필요합니다.")
        print("   .env 파일에 SUPABASE_URL과 SUPABASE_KEY를 설정하세요.")
        return False
    
    try:
        saved_count = 0
        updated_count = 0
        error_count = 0
        
        for idx, row in df.iterrows():
            try:
                # 선수 ID 생성 (이름 기반)
                player_api_id = f"nba_{row['PLAYER_NAME'].lower().replace(' ', '_').replace('.', '')}"
                
                # 1. 선수 정보 저장/업데이트
                player_data = {
                    'player_id': player_api_id,
                    'name': row['PLAYER_NAME'],
                    'team': row.get('TEAM_ABBREVIATION', 'N/A'),
                    'position': None,  # NBA API에서 포지션 정보가 없으면 None
                    'updated_at': datetime.now().isoformat()
                }
                
                # 선수가 이미 있는지 확인
                existing_player = supabase.table('nba_players').select('id').eq('player_id', player_api_id).execute()
                
                if existing_player.data:
                    # 기존 선수 업데이트
                    player_uuid = existing_player.data[0]['id']
                    supabase.table('nba_players').update(player_data).eq('id', player_uuid).execute()
                    updated_count += 1
                else:
                    # 새 선수 추가
                    result = supabase.table('nba_players').insert(player_data).execute()
                    player_uuid = result.data[0]['id']
                    saved_count += 1
                
                # 2. 시즌 평균 스탯 저장 (player_season_stats 테이블 사용)
                stats_data = {
                    'player_id': player_uuid,
                    'season': season,
                    'games_played': int(row.get('GP', 0)),
                    
                    # 기본 스탯
                    'minutes_played': float(row.get('MIN', 0)),
                    'points': float(row.get('PTS', 0)),
                    'rebounds': float(row.get('REB', 0)),
                    'assists': float(row.get('AST', 0)),
                    'steals': float(row.get('STL', 0)),
                    'blocks': float(row.get('BLK', 0)),
                    'turnovers': float(row.get('TOV', 0)),
                    'fouls': float(row.get('PF', 0)) if 'PF' in row else 0,
                    
                    # 슈팅 스탯
                    'field_goals_made': float(row.get('FGM', 0)),
                    'field_goals_attempted': float(row.get('FGA', 0)) if 'FGA' in row else 0,
                    'field_goal_percentage': float(row.get('FG_PCT', 0) * 100) if row.get('FG_PCT') else 0,
                    'three_pointers_made': float(row.get('FG3M', 0)),
                    'three_pointers_attempted': float(row.get('FG3A', 0)) if 'FG3A' in row else 0,
                    'three_point_percentage': float(row.get('FG3_PCT', 0) * 100) if row.get('FG3_PCT') else 0,
                    'free_throws_made': float(row.get('FTM', 0)),
                    'free_throws_attempted': float(row.get('FTA', 0)) if 'FTA' in row else 0,
                    'free_throw_percentage': float(row.get('FT_PCT', 0) * 100) if row.get('FT_PCT') else 0,
                    
                    # 고급 스탯
                    'offensive_rebounds': float(row.get('OREB', 0)),
                    'defensive_rebounds': float(row.get('DREB', 0)) if 'DREB' in row else 0,
                    'double_doubles': int(row.get('DD2', 0)),
                    'triple_doubles': int(row.get('TD3', 0)),
                    'updated_at': datetime.now().isoformat()
                }
                
                # 시즌 스탯 저장 (upsert: 있으면 업데이트, 없으면 추가)
                existing_stats = supabase.table('player_season_stats').select('id').eq('player_id', player_uuid).eq('season', season).execute()
                
                if existing_stats.data:
                    # 기존 스탯 업데이트
                    supabase.table('player_season_stats').update(stats_data).eq('player_id', player_uuid).eq('season', season).execute()
                else:
                    # 새 스탯 추가
                    supabase.table('player_season_stats').insert(stats_data).execute()
                
                if (idx + 1) % 50 == 0:
                    print(f"   진행 중... {idx + 1}/{len(df)} 선수 처리 완료")
                    
            except Exception as e:
                error_count += 1
                if error_count <= 5:  # 처음 5개 에러만 출력
                    print(f"   ⚠️ {row.get('PLAYER_NAME', 'Unknown')} 저장 실패: {e}")
        
        print("=" * 80)
        print(f"✅ Supabase 업로드 완료!")
        print(f"   - 새로 추가된 선수: {saved_count}명")
        print(f"   - 업데이트된 선수: {updated_count}명")
        if error_count > 0:
            print(f"   - 오류 발생: {error_count}건")
        
        return True
        
    except Exception as e:
        print(f"❌ Supabase 저장 오류: {e}")
        return False


def main():
    """
    메인 함수
    """
    print("\n" + "=" * 80)
    print("🏀 NBA 선수 통계 수집 프로그램")
    print("=" * 80)
    
    # 현재 시즌 자동 계산
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    # 10월 이후면 새 시즌, 아니면 이전 시즌
    if current_month >= 10:
        season = f"{current_year}-{str(current_year + 1)[2:]}"
    else:
        season = f"{current_year - 1}-{str(current_year)[2:]}"
    
    print(f"\n📅 시즌: {season}")
    
    # 사용자에게 시즌 입력 받기 (선택사항)
    custom_season = input(f"다른 시즌을 조회하시겠습니까? (엔터: {season} 사용, 또는 시즌 입력 예: 2024-25): ").strip()
    if custom_season:
        season = custom_season
    
    # 선수 통계 가져오기
    print(f"\n⏳ 데이터를 가져오는 중... (약 5-10초 소요)")
    df = fetch_nba_player_stats(season)
    
    if df is not None and not df.empty:
        # 통계 출력
        display_top = input(f"\n상위 몇 명을 출력하시겠습니까? (기본: 50): ").strip()
        top_n = int(display_top) if display_top.isdigit() else 50
        
        display_stats(df, top_n=top_n)
        
        # Supabase 저장 여부 확인
        supabase_option = input(f"\nSupabase에 저장하시겠습니까? (y/n): ").strip().lower()
        if supabase_option == 'y':
            save_to_supabase(df, season)
        
        # CSV 저장 여부 확인
        csv_option = input(f"\nCSV 파일로 저장하시겠습니까? (y/n): ").strip().lower()
        if csv_option == 'y':
            filename = f"nba_stats_{season.replace('-', '_')}.csv"
            save_to_csv(df, filename)
    
    print("\n✅ 프로그램을 종료합니다.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
