# Japanese Novel Ruby Plugin for Obsidian

日本語の小説で一般的に使われているルビ記号を表示＆挿入するためのObsidianプラグインです。

「青空文庫」「小説家になろう」などの日本語小説用Webサイトで広く使われているルビ記法を採用しています。

書き方の例：

| 入力テキスト   | ルビ表示                   |
| ------------ | ------------------------------- |
| 長い｜文章《ぶんしょう》 | 長い<ruby>文章<rt>ぶんしょう</rt></ruby> |
| 長い文章《ぶんしょう》  | 長い<ruby>文章<rt>ぶんしょう</rt></ruby> |
| ｜傍《・》｜点《・》  | <ruby>傍<rt>・</rt></ruby><ruby>点<rt>・</rt></ruby> |


## このプラグインでできること



- ルビを含むドキュメントをプレビューしながら編集できます
  - ソースモードでのルビ表示を設定でON/OFFできます
- 設定画面などは英語 / 日本語に対応しています。
* コマンド：
    * **novel-ruby-insert** : ルビ挿入ダイアログを表示します。選択中のテキストがある場合、本文としてセットされます。
    * **novel-ruby-insert-dot** : 選択テキストに傍点を振ります。傍点の文字は設定で変更できます。
    * **novel-ruby-remove** : 選択範囲のテキストからすべてのルビ記号を削除します。

## See Also

このプラグインはマークダウン形式のルビ記法に対応していません。

マークダウン形式を使いたい場合は、[obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana) をオススメします。

## Acknowledgments

@steven-kraft 氏に感謝します。ルビ解析コードの一部は [obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana)プラグインを参考にしました。

@phibr0 氏に感謝します。ローカライズ用コードは [obsidian-commander](https://github.com/phibr0/obsidian-commander) プラグインを参考にしました。


## Support

このプラグインを気に入ったら、サポートを考えて頂けると嬉しいです。

<!-- Buy Me a Coffee embedded button -->
<a href="https://www.buymeacoffee.com/quels"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-orange.png" height="50px"></a>
