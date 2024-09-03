//-----------Подключаемые модули-----------//
const Docx = require('./../Docx/Docx');
//-----------Подключаемые модули-----------//

/**
 * Класс, являющийся обработчиком запросов
 */
class HundlerRequest {

    /**
     * Функция, которая направляет запрос на обработку, а после возвращает результат обработки
     */
    static async Router(message) {
        switch (message.type_request) {
            case "GET /docx":
                return await HundlerRequest.GetDocxCreate(message);
        }
        return { message: "request is not defined" };
    }

    /**
     * 
     */
    static async GetDocxCreate(message) {
        let start = new Date().getTime();
        console.log(`Обрабатываем GetDocxCreate запрос...`);
        console.log(message);

        //-------------------------------------------------------//
        let data = await Docx.CreateDocx(message);
        //-------------------------------------------------------//

        let finish = new Date().getTime();
        console.log(`Ссылка: {${data}} GetDocxCreate обработан за {${(finish - start) / 1000}} сек.`);

        return data;
    }
}
//-----------Экспортируемые модули-----------//
module.exports = HundlerRequest;
//-----------Экспортируемые модули-----------//