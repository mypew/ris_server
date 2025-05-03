//-----------Подключаемые модули-----------//
const Docx = require('./../Docx/Docx');
const Ris = require('./../BibStan/Ris');
const Bibtex = require('./../BibStan/Bibtex');
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
            case "GET /ris":
                return await HundlerRequest.GetRis(message);
            case "GET /bibtex":
                return await HundlerRequest.GetBibtex(message);
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

    /**
     * 
     */
    static async GetRis(message) {
        let start = new Date().getTime();
        console.log(`Обрабатываем GetRis запрос...`);
        console.log(message);

        //-------------------------------------------------------//
        let data = await Ris.Get(message);
        //-------------------------------------------------------//

        let finish = new Date().getTime();
        console.log(`GetRis обработан за {${(finish - start) / 1000}} сек.`);

        return data;
    }

    /**
     * 
     */
    static async GetBibtex(message) {
        let start = new Date().getTime();
        console.log(`Обрабатываем GetBibtex запрос...`);
        console.log(message);

        //-------------------------------------------------------//
        let data = await Bibtex.Get(message);
        //-------------------------------------------------------//

        let finish = new Date().getTime();
        console.log(`GetBibtex обработан за {${(finish - start) / 1000}} сек.`);

        return data;
    }
}
//-----------Экспортируемые модули-----------//
module.exports = HundlerRequest;
//-----------Экспортируемые модули-----------//