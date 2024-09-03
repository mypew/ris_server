//-----------Подключаемые модули-----------//
//-----------Подключаемые модули-----------//

/**
 * Класс для транслитерации слов(Привет -> Privet)
 */
class WordTransliteration {
    static async Transliteration(str, from_language, to_language) {
      let result = "";
      let count = 0;

      if (from_language == "RU" && to_language == "EU") {
        while (count != str.length) {
          switch(str[count]) {
            case ' ':
              result += ' ';
              break;
            case 'А':
              result += 'A';
              break;
            case 'Б':
              result += 'B';
              break;
            case 'В':
              result += 'V';
              break;
            case 'Г':
              result += 'G';
              break;
            case 'Д':
              result += 'D';
              break;
            case 'Е':
              result += 'E';
              break;
            case 'Ё':
              result += 'Yo';
              break;
            case 'Ж':
              result += 'Zh';
              break;
            case 'З':
              result += 'Z';
              break;
            case 'И':
              result += 'I';
              break;
            case 'Й':
              result += 'J';
              break;
            case 'К':
              result += 'K';
              break;
            case 'Л':
              result += 'L';
              break;
            case 'М':
              result += 'M';
              break;
            case 'Н':
              result += 'N';
              break;
            case 'О':
              result += 'O';
              break;
            case 'П':
              result += 'P';
              break;
            case 'Р':
              result += 'R';
              break;
            case 'С':
              result += 'S';
              break;
            case 'Т':
              result += 'T';
              break;
            case 'У':
              result += 'U';
              break;
            case 'Ф':
              result += 'F';
              break;
            case 'Х':
              result += 'H';
              break;
            case 'Ц':
              result += 'C';
              break;
            case 'Ч':
              result += 'Ch';
              break;
            case 'Ш':
              result += 'Sh';
              break;
            case 'Щ':
              result += 'Sch';
              break;
            case 'Ы':
              result += 'Y';
              break;
            case 'Э':
              result += 'Je';
              break;
            case 'Ю':
              result += 'Yu';
              break;
            case 'Я':
              result += 'Ya';
              break;
            case 'а':
              result += 'a';
              break;
            case 'б':
              result += 'b';
              break;
            case 'в':
              result += 'v';
              break;
            case 'г':
              result += 'g';
              break;
            case 'д':
              result += 'd';
              break;
            case 'е':
              result += 'e';
              break;
            case 'ё':
              result += 'yo';
              break;
            case 'ж':
              result += 'zh';
              break;
            case 'з':
              result += 'z';
              break;
            case 'и':
              result += 'i';
              break;
            case 'й':
              result += 'j';
              break;
            case 'к':
              result += 'k';
              break;
            case 'л':
              result += 'l';
              break;
            case 'м':
              result += 'm';
              break;
            case 'н':
              result += 'n';
              break;
            case 'о':
              result += 'o';
              break;
            case 'п':
              result += 'p';
              break;
            case 'р':
              result += 'r';
              break;
            case 'с':
              result += 's';
              break;
            case 'т':
              result += 't';
              break;
            case 'у':
              result += 'u';
              break;
            case 'ф':
              result += 'f';
              break;
            case 'х':
              result += 'h';
              break;
            case 'ц':
              result += 'c';
              break;
            case 'ч':
              result += 'ch';
              break;
            case 'ш':
              result += 'sh';
              break;
            case 'щ':
              result += 'sch';
              break;
            case 'ы':
              result += 'y';
              break;
            case 'э':
              result += 'je';
              break;
            case 'ю':
              result += 'yu';
              break;
            case 'я':
              result += 'ya';
              break;
            case '.':
              result += '.';
              break;
            case ',':
              result += ',';
              break;
            case '-':
              result += '-';
              break;
            case '=':
              result += '=';
              break;
          }
          count++;
        }
      } else {
        result = "Translation of these languages is not supported";
      }

      return result;
    }
}

//-----------Экспортируемые модули-----------//
module.exports = WordTransliteration;
//-----------Экспортируемые модули-----------//