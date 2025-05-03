//-----------Подключаемые модули-----------//
const Mysql = require('./../Data/Mysql');
const WordTransliteration = require('./../SubModules/WordTransliteration');
//-----------Подключаемые модули-----------//

class Bibtex {
  static async Get(message) {
    let result = '';

    if(message.type == 'single') {
      result = await Bibtex.Create(message.id_publication);
    }
    else if(message.type == 'array') {
      for(let i = 0; i < message.id_publications.length; i++) {
        result += await Bibtex.Create(message.id_publications[i]);
        result += '\n';
      }
    }

    return result;
  }

  static async Create(id_publication) {
    let publication = (await Mysql.Request(`SELECT * FROM bree7e_cris_publications WHERE id=${id_publication}`))[0];
    let user = {surname: "NONE"};
    if (publication.added_by_rb_user_id) {
      user = (await Mysql.Request(`SELECT surname FROM users WHERE id = ${publication.added_by_rb_user_id}`))[0];
      user.surname = await WordTransliteration.Transliteration(user.surname, "RU", "EU");
      user.surname = user.surname.toUpperCase();
    }
    let bibtex = "";

    switch (publication.publication_type_id) {
      case 1:
        bibtex += "@article";
        break;
      case 2:
        bibtex += "@conference";
        break;
      case 3:
        bibtex += "@misc";//?
        break;
      case 4:
        bibtex += "@book";
        break;
      case 5:
        bibtex += "@inbook";//?
        break;
      case 6:
        bibtex += "@mastersthesis";
        break;
      case 7:
        bibtex += "@manual";//?
        break;
      case 8:
        bibtex += "@inproceedings";//?
        break;
      case 9:
        bibtex += "@misc";
        break;
    }

    bibtex += `{${user.surname}${publication.year}${publication.pages},\n`;
    bibtex += (await Bibtex.Param("title", publication.title)) + ",\n";
    bibtex += (await Bibtex.Param("author", publication.authors)) + ",\n";
    bibtex += (await Bibtex.Param("journal", publication.journal)) + ",\n";
    bibtex += (await Bibtex.Param("year", publication.year)) + ",\n";
    bibtex += (await Bibtex.Param("volume", publication.volume)) + ",\n";
    bibtex += (await Bibtex.Param("number", publication.number)) + ",\n";
    bibtex += (await Bibtex.Param("pages", publication.pages)) + ",\n";
    bibtex += (await Bibtex.Param("doi", publication.doi)) + ",\n";
    bibtex += (await Bibtex.Param("url", publication.url)) + ",\n";
    bibtex += (await Bibtex.Param("abstract", publication.annotation)) + "\n";

    bibtex += "}";

    return bibtex;
  }

  static async Param(param, content) {
    content = content !== null ? content : "";

    return `${param} = {${content}}`;
  }
}

//-----------Экспортируемые модули-----------//
module.exports = Bibtex;
//-----------Экспортируемые модули-----------//