import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getMe } from '@/lib/api/k/auth';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const completeOAuthLogin = useAppStore((state) => state.completeOAuthLogin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 쿼리 파라미터에서 토큰 추출
        const accessToken = searchParams.get('access_token');
        const expiresIn = searchParams.get('expires_in');

        if (!accessToken) {
          throw new Error('OAuth 인증에 실패했습니다. 토큰을 받지 못했습니다.');
        }

        // 임시로 토큰을 localStorage에 저장
        localStorage.setItem('access_token', accessToken);

        // 사용자 정보 가져오기
        const user = await getMe();

        // OAuth 로그인 완료 처리
        completeOAuthLogin(accessToken, user);

        // 홈으로 리다이렉트
        navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'OAuth 인증 처리 중 오류가 발생했습니다.');

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, completeOAuthLogin]);

  if (error) {
    return (
      <div className="min-h-screen gradient-dark-bg gradient-overlay flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg">{error}</div>
          <div className="text-muted-foreground text-sm">
            잠시 후 로그인 페이지로 이동합니다...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark-bg gradient-overlay flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <div className="text-lg">로그인 처리 중...</div>
        <div className="text-muted-foreground text-sm">잠시만 기다려주세요</div>
      </div>
    </div>
  );
}
