'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [summary, setSummary] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 로컬 스토리지에서 검색 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setSearchHistory(Array.isArray(history) ? history : []);
      } catch (e) {
        setSearchHistory([]);
      }
    }
  }, []);

  // 검색 기록 저장
  const saveSearchHistory = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    setSearchHistory((prev) => {
      // 중복 제거 및 최신순으로 정렬
      const filtered = prev.filter((item) => item !== trimmedKeyword);
      const updated = [trimmedKeyword, ...filtered].slice(0, 5); // 최근 5개만 유지
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');
    setNews([]);
    setSummary('');
    setMessages([]);

    try {
      // 뉴스 검색
      const newsResponse = await fetch(`/api/news?keyword=${encodeURIComponent(keyword)}`);
      if (!newsResponse.ok) {
        const errorData = await newsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || '뉴스 검색에 실패했습니다.');
      }
      const newsData = await newsResponse.json();
      
      // 뉴스 데이터 확인
      if (!newsData.news || !Array.isArray(newsData.news) || newsData.news.length === 0) {
        throw new Error('검색된 뉴스가 없습니다. 다른 키워드로 시도해주세요.');
      }
      
      setNews(newsData.news);
      
      // 뉴스 검색 성공 시 검색 기록에 추가
      saveSearchHistory(keyword);

      // 뉴스 요약
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ news: newsData.news }),
      });

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || '요약 생성에 실패했습니다.';
        console.error('요약 API 오류:', errorMsg);
        throw new Error(errorMsg);
      }
      const summaryData = await summaryResponse.json();
      
      if (summaryData.error) {
        throw new Error(summaryData.error);
      }
      
      setSummary(summaryData.summary);
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 기록 클릭 시 재검색
  const handleHistoryClick = async (historyKeyword: string) => {
    setKeyword(historyKeyword);
    
    // 검색 실행
    setLoading(true);
    setError('');
    setNews([]);
    setSummary('');
    setMessages([]);

    try {
      // 뉴스 검색
      const newsResponse = await fetch(`/api/news?keyword=${encodeURIComponent(historyKeyword)}`);
      if (!newsResponse.ok) {
        const errorData = await newsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || '뉴스 검색에 실패했습니다.');
      }
      const newsData = await newsResponse.json();
      
      // 뉴스 데이터 확인
      if (!newsData.news || !Array.isArray(newsData.news) || newsData.news.length === 0) {
        throw new Error('검색된 뉴스가 없습니다. 다른 키워드로 시도해주세요.');
      }
      
      setNews(newsData.news);

      // 뉴스 요약
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ news: newsData.news }),
      });

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || '요약 생성에 실패했습니다.';
        console.error('요약 API 오류:', errorMsg);
        throw new Error(errorMsg);
      }
      const summaryData = await summaryResponse.json();
      
      if (summaryData.error) {
        throw new Error(summaryData.error);
      }
      
      setSummary(summaryData.summary);
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || news.length === 0) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setChatLoading(true);
    setError('');

    // 사용자 메시지 추가
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          news: news,
          conversationHistory: newMessages.slice(-10), // 최근 10개 메시지만 전송
        }),
      });

      if (!response.ok) {
        throw new Error('챗봇 응답 생성에 실패했습니다.');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'bot', content: data.reply }]);
    } catch (err: any) {
      setError(err.message || '챗봇 응답 생성 중 오류가 발생했습니다.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📰 뉴스 검색 & 챗봇</h1>

      {error && <div className="error">{error}</div>}

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색할 키워드를 입력하세요..."
            className="search-input"
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? '검색 중...' : '검색'}
          </button>
        </form>
        
        {searchHistory.length > 0 && (
          <div className="search-history">
            <div className="search-history-title">최근 검색어</div>
            <div className="search-history-list">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  className="search-history-item"
                  onClick={() => handleHistoryClick(item)}
                  disabled={loading}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && <div className="loading">뉴스를 검색하고 요약 중입니다...</div>}

      {news.length > 0 && (
        <>
          <div className="news-section">
            <h2 style={{ marginBottom: '20px', fontSize: '24px', color: '#333' }}>
              검색된 뉴스 ({news.length}개)
            </h2>
            <div className="news-list">
              {news.map((item, index) => (
                <div key={index} className="news-item">
                  <div className="news-title">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </div>
                  <div className="news-snippet">{item.snippet}</div>
                  <div className="news-source">출처: {item.source}</div>
                </div>
              ))}
            </div>
          </div>

          {summary && (
            <div className="summary-section">
              <div className="summary-title">📝 뉴스 요약</div>
              <div className="summary-content">{summary}</div>
            </div>
          )}

          <div className="chat-section">
            <div className="chat-title">💬 뉴스에 대해 질문해보세요</div>
            <div className="chat-messages">
              {messages.length === 0 && (
                <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                  뉴스에 대해 궁금한 점을 물어보세요!
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="message bot">답변을 생성하고 있습니다...</div>
              )}
            </div>
            <form onSubmit={handleChat} className="chat-form">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="질문을 입력하세요..."
                className="chat-input"
                disabled={chatLoading}
              />
              <button type="submit" className="chat-button" disabled={chatLoading}>
                전송
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
