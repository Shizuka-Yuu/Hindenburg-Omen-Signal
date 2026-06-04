/**
 * Google Apps Script Web App Endpoint for WSJ Markets Diary Scraper
 * 
 * 使い方:
 * 1. Googleスプレッドシートを新規作成または開きます。
 * 2. メニューの「拡張機能」>「Apps Script」を開きます。
 * 3. エディタ内の既存のコードをすべて削除し、このファイルを丸ごと貼り付けます。
 * 4. 右上の「デプロイ」>「新しいデプロイ」をクリックします。
 * 5. 種類の選択で「ウェブアプリ」を選択します。
 * 6. 設定を以下のように構成します：
 *    - 説明: 任意 (例: WSJ Scraper Endpoint)
 *    - 次のユーザーとして実行: 「自分」(Your account)
 *    - アクセスできるユーザー: 「全員」(Anyone)
 * 7. 「デプロイ」をクリックし、承認を求められたら「アクセスの承認」を行います。
 * 8. 発行された「ウェブアプリのURL」をコピーし、GitHubリポジトリの Settings > Secrets and variables > Actions に
 *    Secret名 `GAS_WEBAPP_URL` として登録します。
 */

function doPost(e) {
  try {
    // 同時書き込みを防ぐためのシリアル・ロック (最大30秒待機)
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    
    // 送信されてきたJSONをパース
    const postData = JSON.parse(e.postData.contents);
    const date = postData.date; // 例: "2026-06-04"
    
    // スプレッドシートとシートの取得 (存在しなければ自動生成)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Markets_Diary");
    if (!sheet) {
      sheet = ss.insertSheet("Markets_Diary");
    }
    
    // ヘッダーの定義
    const headers = [
      "Date",
      "NYSE Issues Advancing", "NYSE Issues Declining", "NYSE Issues Unchanged", "NYSE Issues Total",
      "NYSE New Highs", "NYSE New Lows",
      "NYSE Share Volume Total", "NYSE Share Volume Advancing", "NYSE Share Volume Declining", "NYSE Share Volume Unchanged",
      "NASDAQ Issues Advancing", "NASDAQ Issues Declining", "NASDAQ Issues Unchanged", "NASDAQ Issues Total",
      "NASDAQ New Highs", "NASDAQ New Lows",
      "NASDAQ Share Volume Total", "NASDAQ Share Volume Advancing", "NASDAQ Share Volume Declining", "NASDAQ Share Volume Unchanged"
    ];
    
    // 初めての実行時にヘッダーを挿入
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }
    
    // 追加するデータの配列を作成
    const rowValues = [
      date,
      postData.nyse.issues.advancing,
      postData.nyse.issues.declining,
      postData.nyse.issues.unchanged,
      postData.nyse.issues.total,
      postData.nyse.new_highs_lows.new_highs,
      postData.nyse.new_highs_lows.new_lows,
      postData.nyse.share_volume.total,
      postData.nyse.share_volume.advancing,
      postData.nyse.share_volume.declining,
      postData.nyse.share_volume.unchanged,
      postData.nasdaq.issues.advancing,
      postData.nasdaq.issues.declining,
      postData.nasdaq.issues.unchanged,
      postData.nasdaq.issues.total,
      postData.nasdaq.new_highs_lows.new_highs,
      postData.nasdaq.new_highs_lows.new_lows,
      postData.nasdaq.share_volume.total,
      postData.nasdaq.share_volume.advancing,
      postData.nasdaq.share_volume.declining,
      postData.nasdaq.share_volume.unchanged
    ];
    
    // 重複チェック: 最終行のDate（先頭10文字の YYYY-MM-DD 部分）が同じ場合、データを追記するのではなく最終行を上書きする
    const lastRow = sheet.getLastRow();
    let isDuplicate = false;
    
    if (lastRow > 1) {
      const lastDateVal = sheet.getRange(lastRow, 1).getValue();
      let lastDateCal = "";
      
      if (lastDateVal instanceof Date) {
        // Date型の場合は YYYY-MM-DD 形式にフォーマット
        const y = lastDateVal.getFullYear();
        const m = ("0" + (lastDateVal.getMonth() + 1)).slice(-2);
        const d = ("0" + lastDateVal.getDate()).slice(-2);
        lastDateCal = y + "-" + m + "-" + d;
      } else {
        // 文字列の場合は先頭10文字を取得
        lastDateCal = String(lastDateVal).trim().substring(0, 10);
      }
      
      const incomingDateCal = date.substring(0, 10);
      
      if (lastDateCal === incomingDateCal) {
        isDuplicate = true;
        // 最終行 of セル範囲に新しいデータを上書き
        const rowRange = sheet.getRange(lastRow, 1, 1, headers.length);
        rowRange.setValues([rowValues]);
      }
    }
    
    // 重複でなければ新規行を追加
    if (!isDuplicate) {
      sheet.appendRow(rowValues);
    }
    
    // ロック解放
    lock.releaseLock();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: isDuplicate ? "Existing row updated" : "New row appended"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 認証・セットアップ用関数
// 初回のみ、この関数を選択してエディタの「実行」ボタンを押し、権限の承認を行ってください。
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    console.log("スプレッドシートの紐付けに成功しました: " + ss.getName());
    let sheet = ss.getSheetByName("Markets_Diary");
    if (!sheet) {
      sheet = ss.insertSheet("Markets_Diary");
      console.log("シート 'Markets_Diary' を作成しました。");
    }
  } else {
    console.error("スプレッドシートへのアクセスに失敗しました。このスクリプトがスプレッドシートの「拡張機能」>「Apps Script」から作成されているか確認してください。");
  }
}
