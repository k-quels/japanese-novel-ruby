# Japanese Novel Ruby Plugin for Obsidian

English | [日本語](README_ja.md)

Obsidian plugin for display & insert ruby(Furigana) ​​marks commonly used in Japanese novels.

The ruby syntax of this plugin is a format widely used by Japanese novel web sites, such as 「青空文庫」「小説家になろう」 and others.

Format example:

| Input Text   | Rendered Ruby                   |
| ------------ | ------------------------------- |
| 長い｜文章《ぶんしょう》 | 長い<ruby>文章<rt>ぶんしょう</rt></ruby> |
| 長い文章《ぶんしょう》  | 長い<ruby>文章<rt>ぶんしょう</rt></ruby> |
| ｜傍《・》｜点《・》  | <ruby>傍<rt>・</rt></ruby><ruby>点<rt>・</rt></ruby> |


## What you can do with this plugin


<img width="500" alt="JapaneseNovelRuby_sample" src="https://github.com/user-attachments/assets/8e93c4e2-fef5-489e-84a8-e523f7e8f25d">



- Edit documents while previewing ruby
  - Enable / disable ruby preview in source mode via plugin settings.
  - Ruby can be enabled for specific notes only. (Turn on the option and set the property "enable_ruby: true") (from ver. 1.2.0)
  - You can change the ruby marks for non-Japanese novel use. e.g. 《》 → 【】 (from ver. 1.2.0)
- The user interface is available in English / Japanese / Simplified Chinese / Traditional Chinese.


  
* Commands:
    * <img alt="novel-ruby-insert icon" src="https://github.com/user-attachments/assets/b55ebe72-e76a-4945-99aa-3ba046d80d7a" width="18px"> **novel-ruby-insert** : Show a dialog to insert ruby. Set selected text as body.
    * <img alt="novel-ruby-insert-direct icon" src="https://github.com/user-attachments/assets/b077b267-b96a-4c43-bd73-41e327c7b4da" width="18px"> **novel-ruby-insert-direct** : Insert ruby marks directly in the editor without opening a dialog.
    * <img alt="novel-ruby-insert-dot icon" src="https://github.com/user-attachments/assets/fd67cc95-3176-4b88-a88b-2639b0b639bd" width="18px"> **novel-ruby-insert-dot** : Insert emphasis dots in selected text.
    * <img alt="novel-ruby-remove icon" src="https://github.com/user-attachments/assets/73d05435-808a-4739-b1c1-310f4a89a287" width="18px"> **novel-ruby-remove** : Remove all ruby marks from selected text.
    * <img alt="novel-ruby-toggle-ruby-hidden icon" src="https://github.com/user-attachments/assets/ff0e0bf6-2056-4f0d-8cc2-2c8c0e2c8b9d" width="18px"> **novel-ruby-toggle-ruby-hidden** : Toggle 'Hide ruby unless hover' setting.

## See Also

This plugin doesn't support markdown ruby format.

If you want to use it, consider to use [obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana) plugin.

## Acknowledgments

Thanks to @steven-kraft. Part of the Ruby parsing code was inspired by [obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana) plugin.

Thanks to @phibr0. The localization code is based on the [obsidian-commander](https://github.com/phibr0/obsidian-commander) plugin.

Special thanks to @Moyf and @MinZe25 for their PRs and suggestions regarding the new features in ver. 1.2.0 and Simplified Chinese localization support!

Special thanks to @chungchungdev for the PR regarding Traditional Chinese localization support!

## Support

If you like this plugin, please consider supporting my work. Thank you!

<!-- Buy Me a Coffee embedded button -->
<a href="https://www.buymeacoffee.com/quels"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-orange.png" height="50px"></a>
