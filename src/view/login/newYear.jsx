import React, { Component } from 'react';
import './index.less'
class NewYear extends Component {
  componentDidMount() {
    let pinyin1 = document.getElementById("pinyin1");
    let pinyin2 = document.getElementById("pinyin2");
    let pinyin3 = document.getElementById("pinyin3");
    let pinyin4 = document.getElementById("pinyin4");

    let phraseChinese1 = document.getElementById("phraseChinese1");
    let phraseChinese2 = document.getElementById("phraseChinese2");
    let phraseChinese3 = document.getElementById("phraseChinese3");
    let phraseChinese4 = document.getElementById("phraseChinese4");

    let phraseEnglish = document.getElementById("phraseEnglish");

    let parent = document.getElementById("parent");
    let random = Math.random();

    // Arrays for pinyin and Chinese characters
    let p1 = [
      "xīn",
      "gōng",
      "dà",
      "wàn",
      "nián",
      "shēn",
      "xīn",
      "gōng"
    ];

    let p2 = [
      "nián",
      "xǐ",
      "jí",
      "shì",
      "nián",
      "tǐ",
      "xiǎng",
      "hè"
    ];

    let p3 = [
      "kuài",
      "fā",
      "dà",
      "rú",
      "yǒu",
      "jiàn",
      "shì",
      "xīn"
    ];

    let p4 = [
      "lè",
      "cái",
      "lì",
      "yì",
      "yú",
      "kāng",
      "chéng",
      "xǐ"
    ];

    let phrasesC1 = [
      "新",
      "恭",
      "大",
      "萬",
      "年",
      "身",
      "心",
      "恭"
    ];

    let phrasesC2 = [
      "年",
      "喜",
      "吉",
      "事",
      "年",
      "體",
      "想",
      "賀"
    ];

    let phrasesC3 = [
      "快",
      "發",
      "大",
      "如",
      "有",
      "健",
      "事",
      "新"
    ];

    let phrasesC4 = [
      "樂",
      "財",
      "利",
      "意",
      "餘",
      "康",
      "成",
      "禧"
    ];

    let phrasesE = [
      "(Happy new year)",
      "(Congratulations on your prosperity)",
      "(Great luck and prosperity)",
      "(May 10,000 things go according to your wishes)",
      "(Every year have more than you need)",
      "(Wishing you good health)",
      "(May all your heart's desires come true)",
      "(Congratulations in the new year)"
    ];

    // Sets text content as random phrase from arrays
    pinyin1.textContent = p1[Math.floor(random * p1.length)];
    pinyin2.textContent = p2[Math.floor(random * p2.length)];
    pinyin3.textContent = p3[Math.floor(random * p3.length)];
    pinyin4.textContent = p4[Math.floor(random * p4.length)];
    phraseChinese1.textContent = phrasesC1[Math.floor(random * phrasesC1.length)];
    phraseChinese2.textContent = phrasesC2[Math.floor(random * phrasesC2.length)];
    phraseChinese3.textContent = phrasesC3[Math.floor(random * phrasesC3.length)];
    phraseChinese4.textContent = phrasesC4[Math.floor(random * phrasesC4.length)];
    phraseEnglish.textContent = phrasesE[Math.floor(random * phrasesE.length)];

    let onClick = function () {
      let random = Math.random();

      pinyin1.textContent = p1[Math.floor(random * p1.length)];
      pinyin2.textContent = p2[Math.floor(random * p2.length)];
      pinyin3.textContent = p3[Math.floor(random * p3.length)];
      pinyin4.textContent = p4[Math.floor(random * p4.length)];
      phraseChinese1.textContent = phrasesC1[Math.floor(random * phrasesC1.length)];
      phraseChinese2.textContent = phrasesC2[Math.floor(random * phrasesC2.length)];
      phraseChinese3.textContent = phrasesC3[Math.floor(random * phrasesC3.length)];
      phraseChinese4.textContent = phrasesC4[Math.floor(random * phrasesC4.length)];
      phraseEnglish.textContent = phrasesE[Math.floor(random * phrasesE.length)];
    }

    // Sets text content as random phrase when button is clicked
    parent.addEventListener("click", onClick);
  }

  render() {
    return (
      <div className="new-year" id="parent">
        <table>
          <tbody>
            <tr>
              <th className="pinyin" id="pinyin1">xīn</th>
              <th className="pinyin" id="pinyin2">nián</th>
              <th className="pinyin" id="pinyin3">kuài</th>
              <th className="pinyin" id="pinyin4">lè</th>
            </tr>
            <tr>
              <td id="phraseChinese1">新</td>
              <td id="phraseChinese2">年</td>
              <td id="phraseChinese3">快</td>
              <td id="phraseChinese4">樂</td>
            </tr>
          </tbody>
        </table>

        <h2 id="phraseEnglish">(Happy new year)</h2>
      </div>
    );
  }
}

export default NewYear;