//-----------Подключаемые модули-----------//
//-----------Подключаемые модули-----------//

/**
 * Класс для получения названия месяца по его числу-1
 */
class Month {
  static async IntToStr(number) {
    switch (number) {
      case 0:
        return "Января";
      case 1:
        return "Февраля";
      case 2:
        return "Марта";
      case 3:
        return "Апреля";
      case 4:
        return "Мая";
      case 5:
        return "Июня";
      case 6:
        return "Июля";
      case 7:
        return "Августа";
      case 8:
        return "Сентября";
      case 9:
        return "Октября";
      case 10:
        return "Ноября";
      case 11:
        return "Декабря";
    }

    return "???";
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Month;
//-----------Экспортируемые модули-----------//