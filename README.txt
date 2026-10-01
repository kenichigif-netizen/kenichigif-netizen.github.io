釣果メモ v16：写真2枚＋動画対応

追加機能
- 写真は最大2枚
- HEIC/HEIFを含む写真をJPEG変換して保存
- 動画は1本
- 対応動画: .mp4 / .mov / .webm
- 動画は3分以内
- MP4/MOVはブラウザが再生時間を読めない場合でもコンテナのmvhdを直接解析
- 詳細画面で写真2枚と動画を表示
- 記録削除時に写真2枚・動画もまとめて削除

初回のみ必要
1. Supabase SQL Editorで supabase-media-v16.sql を実行
2. GitHub Pagesに index.html / style.css / script.js を上書き

Storage
- 既存の fish-photos バケットをそのまま使います。
- 動画は user_id/videos/ 以下へ保存します。
