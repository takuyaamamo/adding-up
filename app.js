'use strict';
// モジュールの呼び出し、fsはファイルを扱う意味、readlineはファイルを一行ずつ文字列で読み込むモジュール
const fs = require('fs');
const readline = require('readline');
// ReadStreamはファイルを読み込むストリームの生成
const rs = fs.ReadStream('./popu-pref.csv');
// 更にcreateInterfaceでrsをinputに設定しrlオブジェクトを生成している。
const rl = readline.createInterface({ 'input': rs, 'output': {} });
// onでlineイベントが発生したら無名関数を実行する処理を行う。lineは1行のあと/nを検出すると発生する
// Mapを使用するとデータの追加をsetメソッド、抜き出しをgetメソッドで扱える
// key: 都道府県 value: 集計データのオブジェクト
const prefectureDataMap = new Map();
rl.on('line', (lineString) => {
  // 分割
  const columns = lineString.split(',');
  // 整数化
  const year = parseInt(columns[0]);
  const prefecture = columns[2];
  const popu = parseInt(columns[7]);

  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null,
      };
    }
    if (year === 2010) {
      value.popu10 += popu;
    }
    if (year === 2015) {
      value.popu15 += popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
// closeは全てのデータの読み込みが終了した時に発生するイベント
rl.on('close', () => {
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  // Array.formで連想配列を普通の配列に変換している
  // sort関数意味不明、[1]で配列の1番目を持ってきている
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  // ここのmapは配列をkey,valueで受け取り、更に整形できる関数Mapとは違う
  const rankingStrings = rankingArray.map(([key, value]) => {
    return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
  })
  console.log(rankingStrings);
});
