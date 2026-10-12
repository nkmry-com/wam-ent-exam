// すべてのパスに認証をかける（例：'/admin/:path*' にすれば一部だけ保護）
export const config = {
    matcher: '/:path*',
};

export default function middleware(request) {
    // ブラウザから送られてくる Authorization ヘッダーを取得
    const auth = request.headers.get('authorization');

    if (auth) {
        const [scheme, encoded] = auth.split(' ');
        if (scheme === 'Basic' && encoded) {
            // "ユーザー名:パスワード" をデコード
            const decoded = atob(encoded);
            const i = decoded.indexOf(':');
            const user = decoded.slice(0, i);
            const pass = decoded.slice(i + 1);

            // 環境変数と一致すれば通す（何も返さなければ通常どおりHTMLが表示される）
            if (user === process.env.BASIC_AUTH_USER &&
                pass === process.env.BASIC_AUTH_PASSWORD) {
                return;
            }
        }
    }

    // 認証失敗時：401を返してブラウザのログイン画面を出させる
    return new Response('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
}