import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { message, news, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 환경 변수에서 API 키 로드
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY가 환경 변수에 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 사용 가능한 모델명 (우선순위 순)
    const modelNames = [
      'gemini-1.5-flash',      // 무료 티어 기본 모델
      'gemini-1.5-pro',        // 무료 티어 지원
      'gemini-pro'             // 레거시 모델
    ];

    // 뉴스 내용을 컨텍스트로 포함
    let contextPrompt = '';
    if (news && Array.isArray(news) && news.length > 0) {
      const newsText = news
        .map((item: any, index: number) => {
          return `${index + 1}. ${item.title}\n   ${item.snippet}`;
        })
        .join('\n\n');
      
      contextPrompt = `다음은 사용자가 검색한 뉴스 기사들입니다. 이 뉴스들을 참고하여 사용자의 질문에 답변해주세요.

뉴스 기사들:
${newsText}

`;
    }

    // 대화 히스토리 포함
    let historyPrompt = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyPrompt = conversationHistory
        .map((msg: any) => {
          if (msg.role === 'user') {
            return `사용자: ${msg.content}`;
          } else {
            return `챗봇: ${msg.content}`;
          }
        })
        .join('\n') + '\n\n';
    }

    const fullPrompt = `${contextPrompt}${historyPrompt}사용자: ${message}\n챗봇:`;

    let result;
    let response;
    let reply;
    let lastError: any = null;
    let successModel = '';
    
    // 실제 API 호출로 여러 모델명 시도
    for (const modelName of modelNames) {
      try {
        const currentModel = genAI.getGenerativeModel({ model: modelName });
        console.log(`챗봇 API 호출 시도: ${modelName}`);
        result = await currentModel.generateContent(fullPrompt);
        response = await result.response;
        reply = response.text();
        successModel = modelName;
        console.log(`✅ 챗봇 API 호출 성공: ${modelName}`);
        break;
      } catch (e: any) {
        lastError = e;
        const errorMsg = e?.message || e?.toString() || '알 수 없는 오류';
        console.error(`❌ 챗봇 API 호출 실패 (${modelName}):`, errorMsg);
        
        // 429 에러 (할당량 초과)인 경우 다음 모델로 시도
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Too Many Requests')) {
          console.log(`할당량 초과로 다음 모델 시도: ${modelName}`);
          continue;
        }
        
        // 404 에러인 경우 다음 모델로 시도
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          continue;
        }
        
        // 그 외 에러는 즉시 중단 (인증 오류 등)
        throw e;
      }
    }
    
    if (!reply) {
      const errorDetails = lastError?.message || lastError?.toString() || '알 수 없는 오류';
      console.error('모든 모델 시도 실패. 마지막 에러:', errorDetails);
      
      // 할당량 초과 에러인 경우 사용자에게 친절한 메시지
      if (errorDetails.includes('429') || errorDetails.includes('quota')) {
        throw new Error('무료 티어 할당량을 초과했습니다. 잠시 후 다시 시도해주세요. (보통 1분 정도 대기)');
      }
      
      throw new Error(`사용 가능한 모델을 찾을 수 없습니다. 에러: ${errorDetails}`);
    }
    
    console.log(`최종 사용 모델: ${successModel}`);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('챗봇 응답 오류 상세:', error);
    const errorMessage = error?.message || error?.toString() || '알 수 없는 오류';
    console.error('에러 메시지:', errorMessage);
    
    return NextResponse.json(
      { 
        error: '챗봇 응답 생성 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
