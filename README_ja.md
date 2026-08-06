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
    * <img width="18" height="18" alt="novel-ruby-insert_18px" src="https://github.com/user-attachments/assets/6d15aa80-2474-48f7-a2c8-62934bde4c8b" /> **novel-ruby-insert** : ルビ挿入ダイアログを表示します。選択中のテキストがある場合、本文としてセットされます。
    * <img width="18" height="18" alt="novel-ruby-insert-direct_18px" src="https://github.com/user-attachments/assets/85d41e06-ce4c-4f26-94d7-ca6a561c0c4f" /> **novel-ruby-insert-direct** : ダイアログを開かず、直接エディタ上にルビ記号を挿入します。選択中のテキストが本文になります。
    * <img width="18" height="18" alt="novel-ruby-insert-dot_18px" src="https://github.com/user-attachments/assets/a90dc885-acb4-4763-8cea-7d68442974ad" /> **novel-ruby-insert-dot** : 選択テキストに傍点を振ります。傍点の文字は設定で変更できます。
    * <img width="18" height="18" alt="novel-ruby-remove_18px" src="https://github.com/user-attachments/assets/753ad9d7-92ce-4335-840b-3dd24d98c23f" /> **novel-ruby-remove** : 選択範囲のテキストからすべてのルビ記号を削除します。
    * <img width="18" height="18" alt="novel-ruby-toggle-ruby-hidden_18px" src="https://github.com/user-attachments/assets/5e371d0d-66ff-48d9-b6e5-0fc6f44d86b7" /> **novel-ruby-toggle-ruby-hidden** : 「ホバー時以外はルビ非表示」設定のON/OFFを切り替えます。
    * <img width="18" height="18" alt="novel-ruby-toggle-source-mode-render_18px" src="https://github.com/user-attachments/assets/a6010403-1882-4322-887b-9d429ff06daa" /> **novel-ruby-toggle-source-mode-render** : 「ソースモードでルビを表示」設定のON/OFFを切り替えます。

## 制限事項

- テーブル内でルビ本文の開始記号として半角パイプ `|` を使用すると表示が崩れます。
  - テーブル内でルビを扱いたい場合、必ず全角パイプ `｜` を使用してください。

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
