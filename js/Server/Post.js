//-----------Подключаемые модули-----------//
const WorkerController = require('./WorkerController');
const bodyParser = require('body-parser');
//-----------Подключаемые модули-----------//

/**
 * Класс для работы с Get запросами к серверу
 */
class Post {
  /** Объект для работы с сервером */
  app;

  /** Конструктор класса */
  constructor(app) {
    this.app = app;
    this.PostBodyParser();
    this.ListPost();
  }

  /**
   * Список всех обрабатываемых сервером Get запросов
   */
  ListPost() {
    /**  */
    this.app.post('/departments', (req, res) => {
      req.query.type_request = 'POST /departments';
      WorkerController.HandleRequest(req, res);
    });
    /**  */
    this.app.post('/users', (req, res) => {
      req.query.type_request = 'POST /users';
      WorkerController.HandleRequest(req, res);
    });
  }

  /**
   * 
   */
  PostBodyParser() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Post;
//-----------Экспортируемые модули-----------//










