//-----------Подключаемые модули-----------//
const Mysql = require('./../Data/Mysql');
//-----------Подключаемые модули-----------//

class Ris {
  static async Get(message) {
    let result = '';

    if(message.type == 'single') {
      result = await Ris.Create(message.id_publication);
    }
    else if(message.type == 'array') {
      for(let i = 0; i < message.id_publications.length; i++) {
        result += await Ris.Create(message.id_publications[i]);
      }
    }

    return result;
  }

  static async Create(id_publication) {
    if(id_publication == "") return "";
    let publication = (await Mysql.Request(`SELECT * FROM bree7e_cris_publications WHERE id=${id_publication}`))[0];
    let ris = "";

    switch (publication.publication_type_id) {
      case 1:
        ris += await Ris.Param("TY", "JOUR");
        break;
      case 2:
        ris += await Ris.Param("TY", "CONF");
        break;
      case 3:
        ris += await Ris.Param("TY", "GOVDOC");//?
        break;
      case 4:
        ris += await Ris.Param("TY", "BOOK");
        break;
      case 5:
        ris += await Ris.Param("TY", "CHAP");//?
        break;
      case 6:
        ris += await Ris.Param("TY", "THES");
        break;
      case 7:
        ris += await Ris.Param("TY", "JOUR");//?
        break;
      case 8:
        ris += await Ris.Param("TY", "JOUR");//?
        break;
      case 9:
        ris += await Ris.Param("TY", "MULTI");
        break;
    }

    ris += await Ris.Param("TI", publication.title);
    ris += await Ris.Param("AU", publication.authors);
    ris += await Ris.Param("JO", publication.journal);
    ris += await Ris.Param("PY", publication.year);
    ris += await Ris.Param("VL", publication.volume);
    ris += await Ris.Param("IS", publication.number);

    let pages = await Ris.SplitPages(publication.pages);
    ris += await Ris.Param("SP", pages.SP);
    ris += await Ris.Param("EP", pages.EP);

    ris += await Ris.Param("DO", publication.doi);
    ris += await Ris.Param("UR", publication.url);
    ris += await Ris.Param("AB", publication.annotation);
    ris += await Ris.Param("ER", "");

    return ris;
  }

  static async Param(param, content) {
    content = content !== null ? content : "";

    return `${param}  - ${content}\n`;
  }

  static async SplitPages(pages) {
    if(pages.indexOf('-') == -1) {
      return {SP: pages, EP: ""}
    }
    else {
      pages = pages.split('-');
      return {SP: pages[0], EP: pages[1]}
    }
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Ris;
//-----------Экспортируемые модули-----------//