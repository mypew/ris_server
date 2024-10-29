//-----------Подключаемые модули-----------//
//-----------Подключаемые модули-----------//

/**
 * Класс для обработки дат
 */
class MyDate {
  /**
    * Переводит дату js в дату Timestamp для mysql
    */
  static async DateMysqlTimeStamp(date) {
    let result;

    result = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${date.getHours()+8}:${date.getMinutes()}:${date.getSeconds()}`;

    return result;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = MyDate;
//-----------Экспортируемые модули-----------//