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

<img width="500" alt="JapaneseNovelRuby_sample" src="https://github.com/user-attachments/assets/8e93c4e2-fef5-489e-84a8-e523f7e8f25d">


- ルビを含むドキュメントをプレビューしながら編集できます
  - ソースモードでのルビ表示を設定でON/OFFできます
  - 指定ノートでのみルビを有効化できます (該当オプションをON + プロパティ "enable_ruby:true" を指定してください) (ver.1.2.0～)
  - 日本語小説用以外で使う場合は、ルビを示す記号を変更出来ます 例：《》→【】 (ver.1.2.0～)

- 設定画面などは英語 / 日本語 / 中国語(簡体字/繁体字)に対応しています。

* コマンド：
    * **novel-ruby-insert** : ルビ挿入ダイアログを表示します。選択中のテキストがある場合、本文としてセットされます。
    * **novel-ruby-insert-direct** : ダイアログを開かず、直接エディタ上にルビ記号を挿入します。選択中のテキストが本文になります。
    * **novel-ruby-insert-dot** : 選択テキストに傍点を振ります。傍点の文字は設定で変更できます。
    * **novel-ruby-remove** : 選択範囲のテキストからすべてのルビ記号を削除します。

## See Also

このプラグインはマークダウン形式のルビ記法に対応していません。

マークダウン形式を使いたい場合は、[obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana) をオススメします。

## Acknowledgments

@steven-kraft 氏に感謝します。ルビ解析コードの一部は [obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana)プラグインを参考にしました。

@phibr0 氏に感謝します。ローカライズ用コードは [obsidian-commander](https://github.com/phibr0/obsidian-commander) プラグインを参考にしました。

ver.1.2.0での機能追加と中国語(簡体字)対応について、PRと提案を下さった @Moyf 氏、@MinZe25 氏に感謝します！

中国語(繁体字)対応について、PRを下さった @chungchungdev 氏に感謝します！

## Support

このプラグインを気に入ったら、サポートを考えて頂けると嬉しいです。

<!-- Buy Me a Coffee embedded button -->
<a href="https://www.buymeacoffee.com/quels"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-orange.png" height="50px"></a>
