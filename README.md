# WebProxy

Bunを使用して構築されたシンプルなHTTPプロキシサーバーで、URLパスに基づいてクライアントリクエストを複数のバックエンドサーバーに転送し、クライアントの実際のIPアドレスを保持します。

## 機能

- パスベースのルーティングを使用したHTTPプロキシサーバー
- `X-Forwarded-For`および`X-Real-IP`ヘッダーでクライアントIPを保持
- 複数のターゲットホストとポートを設定可能
- Bunを使用した高性能
- プロキシポートのみを外部に開放する必要があり、バックエンドサーバーは内部に保持可能
- **リクエストログ**: クライアントIP、リクエストパス、ルーティング情報、レスポンスステータスを表示

## リクエストログ

プロキシサーバーはすべての受信リクエストを以下の形式でログ出力します：

```
[2025-08-27T10:30:00.000Z] 192.168.1.100 - GET /api/users → /api (localhost:3000) - 200 OK
[2025-08-27T10:30:05.000Z] 192.168.1.100 - POST /web/data → /web (localhost:4000) - 201 Created
[2025-08-27T10:30:10.000Z] 192.168.1.100 - GET /health → / (localhost:5000) - 503 Service Unavailable
```

ログ形式: `[タイムスタンプ] クライアントIP - メソッド URL → ルート (ターゲットホスト:ターゲットポート) - ステータスコード ステータステキスト`

## 設定

`src/settings/config.json`を編集してプロキシを設定します：

```json
{
  "listenPort": 8080,
  "routes": [
    {
      "path": "/api",
      "targetHost": "localhost",
      "targetPort": 3000
    },
    {
      "path": "/web",
      "targetHost": "localhost",
      "targetPort": 4000
    },
    {
      "path": "/",
      "targetHost": "localhost",
      "targetPort": 5000
    }
  ]
}
```

プロキシは自動的にこのJSONファイルから設定を読み込みます。

## テストサーバーの起動

このプロジェクトにはプロキシ機能をテストするために使用できるテストサーバーが含まれています。これらのサーバーは設定されたバックエンドポートで実行されます。

### すべてのテストサーバーを起動

```bash
bun run start:servers
# または
npm run start:servers
```

これにより以下のサーバーが起動します：
- APIサーバー（ポート3000）（JSONレスポンス）
- Webサーバー（ポート4000）（HTMLレスポンス）
- デフォルトサーバー（ポート5000）（プレーンテキストレスポンス）

### 個別のサーバーを起動

```bash
bun run start:api      # APIサーバーを起動（ポート3000）
bun run start:web      # Webサーバーを起動（ポート4000）
bun run start:default  # デフォルトサーバーを起動（ポート5000）
```

### テストエンドポイント

テストサーバーが起動したら、プロキシをテストできます：

- `http://localhost:8080/api/users` → APIサーバー（JSON）
- `http://localhost:8080/api/status` → APIサーバー（JSON）
- `http://localhost:8080/web/dashboard` → Webサーバー（HTMLダッシュボード）
- `http://localhost:8080/health` → デフォルトサーバー（JSON）
- `http://localhost:8080/info` → デフォルトサーバー（プレーンテキスト）
- `http://localhost:8080/` → デフォルトサーバー（ウェルカムメッセージ）

## 使用方法

1. 設定されたターゲットポートでバックエンドサーバーを起動
2. プロキシを実行: `bun run src/index.ts`
3. `http://localhost:8080`にリクエストを送信
4. プロキシはURLパスに基づいて適切なバックエンドサーバーにルーティングします
5. 外部に開放する必要があるのはプロキシポート（8080）のみで、バックエンドサーバーはポート開放なしで内部に保持可能

このプロジェクトはBun v1.1.36の`bun init`を使用して作成されました。[Bun](https://bun.sh)は高速なオールインワンJavaScriptランタイムです。
