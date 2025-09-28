//-----------Подключаемые модули-----------//
const WorkerController = require('./WorkerController');
//-----------Подключаемые модули-----------//

/**
 * Класс для работы с Get запросами к серверу
 */
class Get {
  /** Объект для работы с сервером */
  app;

  /** Конструктор класса */
  constructor(app) {
    this.app = app;
    this.EvasionCORS();
    this.ListGet();
  }

  /**
   * Список всех обрабатываемых сервером Get запросов
   */
  ListGet() {
    /**  */
    this.app.get('/docx', (req, res) => {
      req.query.type_request = 'GET /docx';
      WorkerController.HandleRequest(req, res);
    });
    /**  */
    this.app.get('/ris', (req, res) => {
      req.query.type_request = 'GET /ris';
      WorkerController.HandleRequest(req, res);
    });
    /**  */
    this.app.get('/bibtex', (req, res) => {
      req.query.type_request = 'GET /bibtex';
      WorkerController.HandleRequest(req, res);
    });
    this.app.get('/bg_text', (req, res) => {
      req.query.type_request = 'GET /bg_text';
      WorkerController.HandleRequest(req, res);
    });
  }

  /**
   * Функция, которая добавляет дополнительные параметры к возвращаемым запросам, чтобы обходить защиту CORS
   */
  EvasionCORS() {
    /** Функция, которая срабатывает при любых запросах, нужна для обхода защиты CORS */
    this.app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    });
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Get;
//-----------Экспортируемые модули-----------//










