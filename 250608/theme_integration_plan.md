# 250608フォルダへのテーマ切り替え機能統合計画

## 概要
本計画は、`Sphere_Splash`プロジェクトで実装されているライトモードとダークモードの自動切り替え機能を、`250608`フォルダ内のP5.jsベースのコードに適用することを目的としています。手動でのテーマ切り替え機能は含まず、システムのテーマ設定（`prefers-color-scheme`）にのみ対応します。

## 既存コードの分析結果
*   **`Sphere_Splash`**: CSSクラス（`light-mode`, `dark-mode`）とJavaScript（Reactコンポーネントの`App`クラス）を組み合わせてテーマを切り替えています。JavaScriptは`window.matchMedia`を使用してシステムのテーマ設定を検出し、`body`要素に適切なクラスを適用しています。
*   **`250608`フォルダ**:
    *   `index.html`: P5.jsと複数のJavaScriptファイルを読み込むシンプルなHTMLファイルです。HTMLやCSSでのテーマ管理は行われていません。
    *   `palettes.js`: 描画に使用する背景色（`bg`）と描画色（`colors`）の複数のパレットが定義されています。
    *   `sketch.js`: P5.jsのメインロジックを含み、`Drawing`クラスが描画を担っています。コンストラクタでランダムに選択されたパレットから背景色と描画色を設定し、`draw`関数で背景色を適用しています。

## 統合計画

### 1. `palettes.js`の更新
`Sphere_Splash`のライトモードとダークモードのカラーを参考に、`250608`の描画に適したライトモード用とダークモード用のパレットを`palettes.js`に追加します。既存のパレットはそのまま残し、新しいパレットに`isLight`または`isDark`プロパティを追加して識別できるようにします。

**例:**
```javascript
const palettes = [
    // ... 既存のパレット ...
    {
        bg: '#ffffff', // ライトモードの背景色
        colors: ['#333333', '#666666', '#999999'], // ライトモードの描画色
        name: 'light-theme-palette',
        isLight: true,
    },
    {
        bg: '#191919', // ダークモードの背景色
        colors: ['#ffffff', '#cccccc', '#999999'], // ダークモードの描画色
        name: 'dark-theme-palette',
        isDark: true,
    },
];
```

### 2. `sketch.js`の更新
*   **初期テーマ設定の検出**: `setup()`関数内で、`window.matchMedia('(prefers-color-scheme: dark)').matches`を使用して、システムの現在のテーマ設定を取得します。
*   **テーマに応じたパレットの選択**: 取得したテーマ設定に基づいて、`palettes`からライトモード用またはダークモード用のパレットを選択し、`Drawing`インスタンスに渡します。
*   **テーマ変更の監視**: `window.matchMedia`の`addListener`を使用して、システムのテーマ変更を監視し、変更があった場合に動的にパレットを切り替えるロジックを追加します。これにより、ユーザーがシステム設定を変更した際に、P5.jsの描画も自動的に更新されます。

### 3. `index.html`の更新
*   特に変更は不要です。

## アーキテクチャ図

```mermaid
graph TD
    A[ユーザーのシステムテーマ設定] --> B{window.matchMedia};
    B -- prefers-color-scheme: dark --> C{初期テーマ検出};
    C --> D[palettes.js];
    D -- ライト/ダークパレット選択 --> E[sketch.js];
    E -- 背景色/描画色設定 --> F[P5.js描画];
    B -- addListener --> G{テーマ変更監視};
    G --> E;