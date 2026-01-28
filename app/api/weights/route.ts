// API Route: 가중치 관리
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/weights
 * 모든 가중치 설정 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: weights, error } = await supabase
      .from('scoring_weights')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: '가중치를 조회하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      weights,
    });
  } catch (error) {
    console.error('가중치 조회 오류:', error);
    return NextResponse.json(
      { error: '가중치 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weights
 * 새로운 가중치 설정 생성
 */
export async function POST(request: NextRequest) {
  try {
    const weightData = await request.json();
    const supabase = createClient();

    const { data: newWeight, error } = await supabase
      .from('scoring_weights')
      .insert(weightData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '가중치 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      weight: newWeight,
    });
  } catch (error) {
    console.error('가중치 생성 오류:', error);
    return NextResponse.json(
      { error: '가중치 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/weights
 * 가중치 설정 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    const supabase = createClient();

    const { data: updatedWeight, error } = await supabase
      .from('scoring_weights')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '가중치 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      weight: updatedWeight,
    });
  } catch (error) {
    console.error('가중치 수정 오류:', error);
    return NextResponse.json(
      { error: '가중치 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/weights?id=uuid
 * 가중치 설정 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 기본 가중치는 삭제 불가
    const { data: weight } = await supabase
      .from('scoring_weights')
      .select('is_default')
      .eq('id', id)
      .single();

    if (weight?.is_default) {
      return NextResponse.json(
        { error: '기본 가중치는 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('scoring_weights')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: '가중치 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '가중치가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('가중치 삭제 오류:', error);
    return NextResponse.json(
      { error: '가중치 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
