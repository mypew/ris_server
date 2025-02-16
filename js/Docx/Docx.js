//-----------Подключаемые модули-----------//
const docx = require("docx");
const { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, VerticalAlign, AlignmentType, WidthType } = docx;
const fs = require('fs');
const Mysql = require('./../Data/Mysql');
const WordTransliteration = require('./../SubModules/WordTransliteration');
const MyDate = require('./../SubModules/MyDate');
const Month = require('./../SubModules/Month');
const AdmZip = require("adm-zip");
//-----------Подключаемые модули-----------//

class Docx {
    static get MAIN_PATH() {return '/var/www/ris'};

    static async CreateDocx(message) {
        let key = await this.GenerateDocx(message);
        return key;
    }

    static async GenerateDocx(message) {
        let key;
        if (typeof message.form == 'undefined') return "Error";
        if (message.form == 33 || message.form == '33') {
            if (typeof message.author_id == 'undefined' || typeof message.from_year == 'undefined' || typeof message.to_year == 'undefined')
                return "Error";
            else {
                let request = await Mysql.Request(`SELECT surname FROM users WHERE id = ${message.author_id}`);
                if (request.length == 0) return "Error";
                let surnameEU = await WordTransliteration.Transliteration(request[0].surname, "RU", "EU");
                key = `${message.form}_${surnameEU}_${message.from_year}_${message.to_year}_${new Date().getTime()}`;
                key = await this.GenerateForm33(message, key, "../docx/form/form_33.docx");
            }
        } else if (message.form == 'activity') {
            key = `activity`;
            key = await this.GenerateFormActivity(message, key, "../docx/form/form_activity.docx");
        } else if (message.form == 'award') {
            if (typeof message.author_id == 'undefined')
                return "Error";
            else {
                key = `${message.form}_${message.author_id}_${new Date().getTime()}`;
                key = await this.GenerateFormAward(message, key, "../docx/form/form_award.docx");
            }
        } else if (message.form == 'event') {
            key = `event`;
            key = await this.GenerateFormEvent(message, key, "../docx/form/form_event.docx");
        } else if (message.form == 'grand') {
            if (typeof message.author_id == 'undefined' || typeof message.from_year == 'undefined' || typeof message.to_year == 'undefined')
                return "Error";
            else {
                let request = await Mysql.Request(`SELECT surname FROM users WHERE id = ${message.author_id}`);
                if (request.length == 0) return "Error";
                let surnameEU = await WordTransliteration.Transliteration(request[0].surname, "RU", "EU");
                key = `${message.form}_${surnameEU}_${message.from_year}_${message.to_year}_${new Date().getTime()}`;
                key = await this.GenerateFormGrand(message, key, "../docx/form/form_grand.docx");
            }
        } else if (message.form == 'involvement') {
            if (typeof message.author_id == 'undefined' || typeof message.from_year == 'undefined' || typeof message.to_year == 'undefined')
                return "Error";
            else {
                let request = await Mysql.Request(`SELECT surname FROM users WHERE id = ${message.author_id}`);
                if (request.length == 0) return "Error";
                let surnameEU = await WordTransliteration.Transliteration(request[0].surname, "RU", "EU");
                key = `${message.form}_${surnameEU}_${message.from_year}_${message.to_year}_${new Date().getTime()}`;
                key = await this.GenerateFormInvolvement(message, key, "../docx/form/form_involvement.docx");
            }
        } else if (message.form == 'journal') {
            key = `journal`;
            key = await this.GenerateFormJournal(message, key, "../docx/form/form_journal.docx");
        } else if (message.form == 'proceedings') {
            if (typeof message.author_id == 'undefined' || typeof message.from_year == 'undefined' || typeof message.to_year == 'undefined')
                return "Error";
            else {
                let request = await Mysql.Request(`SELECT surname FROM users WHERE id = ${message.author_id}`);
                if (request.length == 0) return "Error";
                let surnameEU = await WordTransliteration.Transliteration(request[0].surname, "RU", "EU");
                key = `${message.form}_${surnameEU}_${message.from_year}_${message.to_year}_${new Date().getTime()}`;
                key = await this.GenerateFormProceedings(message, key, "../docx/form/form_proceedings.docx");
            }
        } else if (message.form == 'author_reference') {
            if (typeof message.id_author_reference == 'undefined')
                return "Error";
            else {
                key = `${message.form}_${message.id_author_reference}_${new Date().getTime()}`;
                key = await this.GenerateFormAuthorReference(message, key, "../docx/form/form_author_reference.docx");
            }
        } else if (message.form == 'expert_opinion') {
            key = `${message.form}_${new Date().getTime()}`;
            key = await this.GenerateFormExpertOpinion(message, key, "../docx/form/form_expert_opinion.docx");
        } else if (message.form == 'export_control') {
            key = `${message.form}_${new Date().getTime()}`;
            key = await this.GenerateFormExportControl(message, key, "../docx/form/form_export_control.docx");
        } else if (message.form == 'export_permit') {
            key = `${message.form}_${new Date().getTime()}`;
            key = await this.GenerateFormExportPermit(message, key, "../docx/form/form_export_permit.docx");
        } else {
            return "Error";
        }

        // Сохранение информации о docx в бд
        let save_params = [
            {name: 'name', value: key, type: 'string'}, 
            {name: 'form', value: message.form, type: 'string'}
        ]

        if(!(typeof message.author_id == 'undefined')) {
            save_params.push({name: 'id_author', value: message.author_id, type: 'int'});
        }
        if(!(typeof message.id_author == 'undefined')) {
            save_params.push({name: 'id_author', value: message.id_author, type: 'int'});
        }
        if(!(typeof message.id_author_reference == 'undefined')) {
            save_params.push({name: 'id_author_reference', value: message.id_author_reference, type: 'int'});
        }

        let sql_params_name = save_params[0].name;
        let sql_params_value = '';
        if(save_params[0].type == 'string')
            sql_params_value += `'${save_params[0].value}'`;
        else sql_params_value += `${save_params[0].value}`;
        for(let i = 1; i < save_params.length; i++) {
            sql_params_name += `,${save_params[i].name}`;
            if(save_params[i].type == 'string')
                sql_params_value += `,'${save_params[i].value}'`;
            else sql_params_value += `,${save_params[i].value}`;
        }

        await Mysql.Request(`INSERT bree7e_cris_docx(${sql_params_name}) VALUES(${sql_params_value})`);
        // Сохранение информации о docx в бд
        
        return key;
    }

    static async GenerateFormExpertOpinion(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let author_reference = await Docx.GetAuthorReference(message.id_author_reference);
        if(author_reference == null) {
            key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'expert_opinion_docx', message.id_author_reference);
            return key;
        }
        // Данные

        // Ввод {expert}
        form.xml = await this.ReplacementParam(form.xml, "{expert}", author_reference.commission_member.fio);
        // Ввод {expert}

        // Ввод {type_and_name}
        form.xml = await this.ReplacementParam(form.xml, "{type_and_name}", `${author_reference.publication_type} ${author_reference.full_name_publication},`);
        // Ввод {type_and_name}

        // Ввод {authors}
        form.xml = await this.ReplacementParam(form.xml, "{authors}", `${author_reference.authors_str},`);
        // Ввод {authors}

        // Ввод {size}
        form.xml = await this.ReplacementParam(form.xml, "{size}", `${author_reference.count_pages} стр.`);
        // Ввод {size}

        // Ввод {type}
        form.xml = await this.ReplacementParam(form.xml, "{type}", author_reference.information);
        // Ввод {type}

        // Ввод {contains_1}
        form.xml = await this.ReplacementParam(form.xml, "{contains_1}", author_reference.contains_1 ? 'содержится' : 'не содержится');
        // Ввод {contains_1}

        // Ввод {contains_2}
        form.xml = await this.ReplacementParam(form.xml, "{contains_2}", author_reference.contains_2 ? 'содержатся' : 'не содержатся');
        // Ввод {contains_2}

        // Ввод {contains_3}
        form.xml = await this.ReplacementParam(form.xml, "{contains_3}", author_reference.contains_3 ? 'содержатся' : 'не содержатся');
        // Ввод {contains_3}

        // Ввод {contains_4}
        form.xml = await this.ReplacementParam(form.xml, "{contains_4}", author_reference.contains_4 ? 'следует' : 'не следует');
        // Ввод {contains_4}

        // Ввод {contains_5}
        form.xml = await this.ReplacementParam(form.xml, "{contains_5}", author_reference.contains_5 ? 'может' : 'не может');
        // Ввод {contains_5}

        // Ввод {member}
        form.xml = await this.ReplacementParam(form.xml, "{member}", author_reference.commission_member.iof);
        // Ввод {member}

        // Ввод {patent_member}
        form.xml = await this.ReplacementParam(form.xml, "{patent_member}", author_reference.commission_patent_member.iof);
        // Ввод {patent_member}

        // Ввод {inspector}
        form.xml = await this.ReplacementParam(form.xml, "{inspector}", author_reference.commission.inspector.iof);
        // Ввод {inspector}

        // Ввод {president}
        form.xml = await this.ReplacementParam(form.xml, "{president}", author_reference.commission.president.iof);
        // Ввод {president}

        key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'expert_opinion_docx', message.id_author_reference);
        return key;
    }

    static async GenerateFormExportControl(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let author_reference = await Docx.GetAuthorReference(message.id_author_reference);
        if(author_reference == null) {
            key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'export_control_docx', message.id_author_reference);
            return key;
        }
        // Данные

        // Ввод {expert}
        form.xml = await this.ReplacementParam(form.xml, "{expert}", author_reference.commission_member.fio);
        // Ввод {expert}

        // Ввод {type_and_name}
        form.xml = await this.ReplacementParam(form.xml, "{type_and_name}", `${author_reference.publication_type} ${author_reference.full_name_publication},`);
        // Ввод {type_and_name}

        // Ввод {authors}
        form.xml = await this.ReplacementParam(form.xml, "{authors}", `${author_reference.authors_str},`);
        // Ввод {authors}

        // Ввод {size}
        form.xml = await this.ReplacementParam(form.xml, "{size}", `${author_reference.count_pages} стр.`);
        // Ввод {size}

        // Ввод {type}
        form.xml = await this.ReplacementParam(form.xml, "{type}", author_reference.information);
        // Ввод {type}

        // Ввод {material}
        form.xml = await this.ReplacementParam(form.xml, "{material}", author_reference.material);
        // Ввод {material}

        // Ввод {contains_2_1}
        form.xml = await this.ReplacementParam(form.xml, "{contains_2_1}", author_reference.contains_2_1 ? 'содержатся' : 'не содержатся');
        // Ввод {contains_2_1}

        // Ввод {type_2}
        form.xml = await this.ReplacementParam(form.xml, "{type_2}", author_reference.information);
        // Ввод {type_2}

        // Ввод {member}
        form.xml = await this.ReplacementParam(form.xml, "{member}", author_reference.commission_member.iof);
        // Ввод {member}

        // Ввод {inspector}
        form.xml = await this.ReplacementParam(form.xml, "{inspector}", author_reference.commission.inspector.iof);
        // Ввод {inspector}

        // Ввод {president}
        form.xml = await this.ReplacementParam(form.xml, "{president}", author_reference.commission.president.iof);
        // Ввод {president}

        key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'export_control_docx', message.id_author_reference);
        return key;
    }

    static async GenerateFormExportPermit(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let author_reference = await Docx.GetAuthorReference(message.id_author_reference);
        if(author_reference == null) {
            key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'export_permit_docx', message.id_author_reference);
            return key;
        }
        // Данные

        // Ввод {expert}
        form.xml = await this.ReplacementParam(form.xml, "{expert}", author_reference.commission_member.fio);
        // Ввод {expert}

        // Ввод {name}
        form.xml = await this.ReplacementParam(form.xml, "{name}", `${author_reference.publication_type} ${author_reference.full_name_publication}`);
        // Ввод {name}

        // Ввод {country_and_event}
        form.xml = await this.ReplacementParam(form.xml, "{country_and_event}", `${author_reference.export_country}, ${author_reference.export_event}`);
        // Ввод {country_and_event}

        // Ввод {purpose_call}
        form.xml = await this.ReplacementParam(form.xml, "{purpose_call}", author_reference.purpose_call);
        // Ввод {purpose_call}

        // Ввод {date}
        let export_date = new Date(author_reference.export_date);
        form.xml = await this.ReplacementParam(form.xml, "{date}", `${String(export_date.getDate()).padStart(2,'0')}.${String(export_date.getMonth()+1).padStart(2,'0')}.${export_date.getFullYear()}`);
        // Ввод {date}

        // Ввод {inspector}
        form.xml = await this.ReplacementParam(form.xml, "{inspector}", author_reference.commission.inspector.iof);
        // Ввод {inspector}

        // Ввод {president}
        form.xml = await this.ReplacementParam(form.xml, "{president}", author_reference.commission.president.iof);
        // Ввод {president}

        key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'export_permit_docx', message.id_author_reference);
        return key;
    }

    static async GenerateFormAuthorReference(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let author_reference = await Docx.GetAuthorReference(message.id_author_reference);
        if(author_reference == null) {
            key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'docx', message.id_author_reference);
            return key;
        }
        // Данные

        // Ввод {authors}
        form.xml = await this.ReplacementParam(form.xml, "{authors}", author_reference.authors_str);
        // Ввод {authors}

        // Ввод {positions}
        form.xml = await this.ReplacementParam(form.xml, "{positions}", author_reference.positions_str);
        // Ввод {positions}

        // Ввод {publication_type}
        form.xml = await this.ReplacementParam(form.xml, "{publication_type}", author_reference.publication_type);
        // Ввод {publication_type}

        // Ввод {full_name_publication}
        form.xml = await this.ReplacementParam(form.xml, "{full_name_publication}", author_reference.full_name_publication);
        // Ввод {full_name_publication}

        // Ввод {count_p}
        form.xml = await this.ReplacementParam(form.xml, "{count_p}", author_reference.count_pages);
        // Ввод {count_p}

        // Ввод {count_i}
        form.xml = await this.ReplacementParam(form.xml, "{count_i}", author_reference.count_images);
        // Ввод {count_i}

        // Ввод {is_literary_sources}
        form.xml = await this.ReplacementParam(form.xml, "{is_literary_sources}", author_reference.is_literary_sources ? 'Использовались' : 'Не использовались');
        // Ввод {is_literary_sources}

        // Ввод {is_information_not_rospatent}
        form.xml = await this.ReplacementParam(form.xml, "{is_information_not_rospatent}", author_reference.is_information_not_rospatent ? 'Использовались' : 'Не использовались');
        // Ввод {is_information_not_rospatent}

        // Ввод {is_information_other_people}
        form.xml = await this.ReplacementParam(form.xml, "{is_information_other_people}", author_reference.is_information_other_people ? 'Заимствованы' : 'Не заимствованы');
        // Ввод {is_information_other_people}

        // Ввод {is_information_inventions}
        form.xml = await this.ReplacementParam(form.xml, "{is_information_inventions}", author_reference.is_information_inventions ? 'Использовались' : 'Не использовались');
        // Ввод {is_information_inventions}

        // Ввод {inventions}
        form.xml = await this.ReplacementParam(form.xml, "{inventions}", author_reference.is_information_inventions ? author_reference.inventions : '');
        // Ввод {inventions}

        // Ввод {is_lock}
        form.xml = await this.ReplacementParam(form.xml, "{is_lock}", author_reference.is_lock ? 'Есть' : 'Нет');
        // Ввод {is_lock}

        // Ввод {nir}
        form.xml = await this.ReplacementParam(form.xml, "{nir}", author_reference.NIR);
        // Ввод {nir}

        // Ввод {information}
        form.xml = await this.ReplacementParam(form.xml, "{information}", author_reference.information);
        // Ввод {information}

        // Ввод {author}
        form.xml = await this.ReplacementParam(form.xml, "{author}", author_reference.author.iof);
        // Ввод {author}

        // Ввод {zav_lab_otdel}
        form.xml = await this.ReplacementParam(form.xml, "{zav_lab_otdel}", author_reference.zav_lab_otdel.iof);
        // Ввод {zav_lab_otdel}

        key = await this.SaveForm(form, key, 'Bree7e\\\\Cris\\\\Models\\\\AuthorReference', 'docx', message.id_author_reference);
        return key;
    }

    static async GenerateFormActivity(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные для переменных
        // Данные для переменных

        // Изменение переменных
        // Изменение переменных

        // Данные для таблиц
        // Данные для таблиц

        // Изменение таблиц
        // Изменение таблиц

        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async GenerateFormAward(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let awards = await Mysql.Request(`SELECT b.name, a.aw_date, a.title, a.aw_num FROM bree7e_cris_awards as a LEFT JOIN bree7e_cris_award_types as b ON a.id_award_type = b.id WHERE id_author = ${message.author_id}`);
        let author = await Mysql.Request(`SELECT name, surname, middlename FROM users WHERE id = ${message.author_id}`);
        let params_table = ["{title}","{date}","{document}"];
        let data_table = [];
        // Данные

        // Изменения
        form.xml = await this.ReplacementParam(form.xml, "{fio}", `${author[0].surname} ${author[0].name} ${author[0].middlename}`);

        for(let i = 0; i < awards.length; i++) {
            data_table[data_table.length] = [];
            data_table[data_table.length-1][0] = awards[i].name;

            let aw_date = (new Date(awards[i].aw_date));
            if(awards[i].aw_date != null)
                data_table[data_table.length-1][1] = String(aw_date.getDate()).padStart(2,'0')+"."+String((aw_date.getMonth()+1)).padStart(2,'0')+"."+aw_date.getFullYear();
            else data_table[data_table.length-1][1] = ' ';

            data_table[data_table.length-1][2] = `${awards[i].title} ${awards[i].aw_num}`;
        }

        form.xml = await this.ReplacementTable(form.xml, params_table, data_table);
        // Изменения

        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async GenerateFormEvent(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные для переменных
        // Данные для переменных

        // Изменение переменных
        // Изменение переменных

        // Данные для таблиц
        // Данные для таблиц

        // Изменение таблиц
        // Изменение таблиц

        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async GenerateFormGrand(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let user = await Mysql.Request(`SELECT name, surname, middlename FROM users WHERE id = ${message.author_id}`);
        let projects_director = await Mysql.Request(`SELECT id,project_number,name,start_year_date,finish_year_date FROM bree7e_cris_projects WHERE rb_user_id=${message.author_id}`);
        let projects_participant = await Mysql.Request(`SELECT id,project_number,name,start_year_date,finish_year_date FROM bree7e_cris_projects WHERE rb_user_id!=${message.author_id} AND id IN (SELECT project_id FROM bree7e_cris_authors_projects WHERE rb_author_id=${message.author_id})`);
        // Данные

        // Ввод {fio}
        form.xml = await this.ReplacementParam(form.xml, "{fio}", `${user[0].surname} ${user[0].name} ${user[0].middlename}`);
        // Ввод {fio}

        // Ввод таблицы с {number_grant} {subject_grant} {date_grant} {status_grand} {function_grand}
        let params_table = ["{number_grant}","{subject_grant}","{date_grant}","{status_grand}","{function_grand}"];
        let data_table = [];

        for(let i = 0; i < projects_director.length; i++) {
            data_table[data_table.length] = [];
            data_table[data_table.length-1][0] = projects_director[i].project_number;
            data_table[data_table.length-1][1] = projects_director[i].name;

            let date_start = (new Date(projects_director[i].start_year_date));
            let date_finish = (new Date(projects_director[i].finish_year_date));
            data_table[data_table.length-1][2] = String(date_start.getDate()).padStart(2,'0')+"."+String((date_start.getMonth()+1)).padStart(2,'0')+"."+date_start.getFullYear()+"-"+String(date_finish.getDate()).padStart(2,'0')+"."+String((date_finish.getMonth()+1)).padStart(2,'0')+"."+date_finish.getFullYear();

            data_table[data_table.length-1][3] = "Руководитель";
            data_table[data_table.length-1][4] = "-";
        }

        for(let i = 0; i < projects_participant.length; i++) {
            data_table[data_table.length] = [];
            data_table[data_table.length-1][0] = projects_participant[i].project_number;
            data_table[data_table.length-1][1] = projects_participant[i].name;

            let date_start = (new Date(projects_participant[i].start_year_date));
            let date_finish = (new Date(projects_participant[i].finish_year_date));
            data_table[data_table.length-1][2] = String(date_start.getDate()).padStart(2,'0')+"."+String((date_start.getMonth()+1)).padStart(2,'0')+"."+date_start.getFullYear()+"-"+String(date_finish.getDate()).padStart(2,'0')+"."+String((date_finish.getMonth()+1)).padStart(2,'0')+"."+date_finish.getFullYear();

            data_table[data_table.length-1][3] = "Исполнитель";
            data_table[data_table.length-1][4] = "-";
        }
        
        form.xml = await this.ReplacementTable(form.xml, params_table, data_table);
        // Ввод таблицы с {number_grant} {subject_grant} {date_grant} {status_grand} {function_grand}

        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async GenerateFormInvolvement(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let user = await Mysql.Request(`SELECT name, surname, middlename FROM users WHERE id = ${message.author_id}`);
        let publications = await Mysql.Request(`SELECT title_event,title,report_type,lvl_event,date_event_start,date_event_end,location_event FROM bree7e_cris_publications where id in (SELECT publication_id FROM bree7e_cris_authors_publications where rb_author_id = ${message.author_id} and reportYear >= ${message.from_year} and reportYear <= ${message.to_year}) and publication_type_id=2;`);
        // Данные

        // Ввод {fio}
        form.xml = await this.ReplacementParam(form.xml, "{fio}", `${user[0].surname} ${user[0].name} ${user[0].middlename}`);
        // Ввод {fio}

        // Ввод таблицы с {type_event} {status_report} {event_level} {topic_report} {date_place} {confirmation}
        let params_table = ["{type_event}","{status_report}","{event_level}","{topic_report}","{date_place}","{confirmation}"];
        let data_table = [];

        for(let i = 0; i < publications.length; i++) {
            if(publications[i].title == null) publications[i].title = "";
            if(publications[i].report_type == null) publications[i].report_type = "";
            if(publications[i].lvl_event == null) publications[i].lvl_event = "";
            if(publications[i].title_event == null) publications[i].title_event = "";

            publications[i].date_and_location = "";

            if(publications[i].location_event != null) publications[i].date_and_location += publications[i].location_event;

            let date_event_start = new Date(publications[i].date_event_start);
            date_event_start = `${String(date_event_start.getDate()).padStart(2,'0')}.${String(date_event_start.getMonth()+1).padStart(2,'0')}.${date_event_start.getFullYear()}`;
            if(publications[i].date_event_start != null && publications[i].location_event != null) publications[i].date_and_location += `, ${date_event_start}`;
            else if(publications[i].date_event_start != null) publications[i].date_and_location += date_event_start;

            let date_event_end = new Date(publications[i].date_event_end);
            date_event_end = `${String(date_event_end.getDate()).padStart(2,'0')}.${String(date_event_end.getMonth()+1).padStart(2,'0')}.${date_event_end.getFullYear()}`;
            if(publications[i].date_event_end != null && publications[i].date_event_start != null) publications[i].date_and_location += ` - ${date_event_end}`;
            else if(publications[i].date_event_end != null && publications[i].location_event != null) publications[i].date_and_location += `, ${date_event_end}`;
            else if(publications[i].date_event_end != null) publications[i].date_and_location += date_event_end;
        }

        for(let i = 0; i < publications.length; i++) {
            data_table.push([]);
            data_table[i][0] = publications[i].title_event;
            data_table[i][1] = publications[i].report_type;
            data_table[i][2] = publications[i].lvl_event;
            data_table[i][3] = publications[i].title;
            data_table[i][4] = publications[i].date_and_location;
            data_table[i][5] = "";
        }

        form.xml = await this.ReplacementTable(form.xml, params_table, data_table);
        // Ввод таблицы с {type_event} {status_report} {event_level} {topic_report} {date_place} {confirmation}

        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async GenerateFormJournal(message, key, path) {
        let form = await this.GenerateForm(path);

        

        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async GenerateFormProceedings(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные
        let user = await Mysql.Request(`SELECT name, surname, middlename FROM users WHERE id = ${message.author_id}`);
        let publications = await Mysql.Request(`SELECT pages, publication_type_id, number, year, title, journal, authors, is_wos, is_scopus, is_risc, is_editable, quartile, quartile_scopus, doi FROM bree7e_cris_publications where id in (SELECT publication_id FROM bree7e_cris_authors_publications where rb_author_id = ${message.author_id} and reportYear >= ${message.from_year} and reportYear <= ${message.to_year});`);
        // Данные

        // Ввод {fio}
        form.xml = await this.ReplacementParam(form.xml, "{fio}", `${user[0].surname} ${user[0].name} ${user[0].middlename}`);
        // Ввод {fio}

        // Ввод {c_pub}
        let c_pub = 0;
        for(let i = 0; i < publications.length; i++) {
            if(publications[i].publication_type_id == 1)
                c_pub++;
        }
        //form.xml = await this.ReplacementParam(form.xml, "{c_pub}", c_pub);
        if (c_pub > 0)
            form.xml = await this.ReplacementParam(form.xml, "{c_pub}", c_pub);
        else form.xml = await this.ReplacementParam(form.xml, "{c_pub}", "-");
        // Ввод {c_pub}

        // Ввод {list_pub}
        let params_list_pub = ["{list_pub}"];
        let data_list_pub = [];
        if (c_pub > 0) {
            for(let i = 0; i < publications.length; i++) {
                if(publications[i].publication_type_id == 1) {
                    data_list_pub.push([]);
                    //console.log(publications[i]);
                    data_list_pub[data_list_pub.length-1][0] = ``;
                    data_list_pub[data_list_pub.length-1][0] += `${data_list_pub.length}.`;
                    if(publications[i].authors != '')
                        data_list_pub[data_list_pub.length-1][0] += ` ${publications[i].authors}`;
                    if(publications[i].title != '')
                        data_list_pub[data_list_pub.length-1][0] += ` ${publications[i].title} //`;
                    if(publications[i].journal != '')
                        data_list_pub[data_list_pub.length-1][0] += ` ${publications[i].journal}.`;
                    if(publications[i].year != '')
                        data_list_pub[data_list_pub.length-1][0] += ` ${publications[i].year}.`;
                    if(publications[i].pages != '')
                        data_list_pub[data_list_pub.length-1][0] += ` С. ${publications[i].pages}.`;
                    if(publications[i].doi != '')
                        data_list_pub[data_list_pub.length-1][0] += ` http://doi.org/${publications[i].doi}`;

                    let dost = [];
                    if(publications[i].is_wos) {
                        let wos = `Web of Science`;
                        if(publications[i].quartile != null) {
                            if(publications[i].quartile != "Q5")
                                wos += ` ${publications[i].quartile}`;
                            else wos += ` ESCI`;
                        }
                        dost.push(wos);
                    }
                    if(publications[i].is_scopus) {
                        let scopus = `Scopus`;
                        if(publications[i].quartile_scopus != null)
                            scopus += ` ${publications[i].quartile_scopus}`;
                        dost.push(scopus);
                    }
                    if(publications[i].is_risc) {
                        let risc = `РИНЦ`;
                        dost.push(risc);
                    }
                    if(publications[i].is_wl) {
                        let wl = `Белый список`;
                        if(publications[i].quartile_wl != null)
                            wl += ` ${publications[i].quartile_wl}`;
                        dost.push(wl);
                    }
                    if(publications[i].is_vak) {
                        let vak = `ВАК`;
                        if(publications[i].quartile_vak != null)
                            vak += ` ${publications[i].quartile_vak}`;
                        dost.push(vak);
                    }
                    
                    if(dost.length > 0) {
                        data_list_pub[data_list_pub.length-1][0] += ` (`
                        for(let i = 0; i < dost.length; i++) {
                            data_list_pub[data_list_pub.length-1][0] += `${dost[i]}`;
                            if(i != (dost.length-1))
                                data_list_pub[data_list_pub.length-1][0] += `,`;
                        }
                        data_list_pub[data_list_pub.length-1][0] += `)`
                    }
                }
            }
            form.xml = await this.ReplacementTable(form.xml, params_list_pub, data_list_pub);
        }
        else {
            form.xml = await this.ReplacementParam(form.xml, "{list_pub}", ".....");
        }
        // Ввод {list_pub}

        // Ввод {c_mon}
        let c_mon = 0;
        for(let i = 0; i < publications.length; i++) {
            if(publications[i].publication_type_id == 4 || publications[i].publication_type_id == 5)
                c_mon++;
        }
        if (c_mon > 0)
            form.xml = await this.ReplacementParam(form.xml, "{c_mon}", c_mon);
        else form.xml = await this.ReplacementParam(form.xml, "{c_mon}", "-");
        // Ввод {c_mon}

        // Ввод {list_mon}
        let params_list_mon = ["{list_mon}"];
        let data_list_mon = [];
        if (c_mon > 0) {
            for(let i = 0; i < publications.length; i++) {
                if(publications[i].publication_type_id == 4 || publications[i].publication_type_id == 5) {
                    data_list_mon.push([]);
                    //console.log(publications[i]);
                    data_list_mon[data_list_mon.length-1][0] = `${data_list_mon.length}. ${publications[i].authors} ${publications[i].title} // ${publications[i].journal}. ${publications[i].year}. С. ${publications[i].pages}`;

                    let dost = [];
                    if(publications[i].is_wos) {
                        let wos = `Web of Science`;
                        if(publications[i].quartile != null) {
                            if(publications[i].quartile != "Q5")
                                wos += ` ${publications[i].quartile}`;
                            else wos += ` ESCI`;
                        }
                        dost.push(wos);
                    }
                    if(publications[i].is_scopus) {
                        let scopus = `Scopus`;
                        if(publications[i].quartile_scopus != null)
                            scopus += ` ${publications[i].quartile_scopus}`;
                        dost.push(scopus);
                    }
                    if(publications[i].is_risc) {
                        let risc = `РИНЦ`;
                        dost.push(risc);
                    }
                    if(publications[i].is_wl) {
                        let wl = `Белый список`;
                        if(publications[i].quartile_wl != null)
                            wl += ` ${publications[i].quartile_wl}`;
                        dost.push(wl);
                    }
                    if(publications[i].is_vak) {
                        let vak = `ВАК`;
                        if(publications[i].quartile_vak != null)
                            vak += ` ${publications[i].quartile_vak}`;
                        dost.push(vak);
                    }
                    
                    if(dost.length > 0) {
                        data_list_mon[data_list_mon.length-1][0] += ` (`
                        for(let i = 0; i < dost.length; i++) {
                            data_list_mon[data_list_mon.length-1][0] += `${dost[i]}`;
                            if(i != (dost.length-1))
                                data_list_mon[data_list_mon.length-1][0] += `,`;
                        }
                        data_list_mon[data_list_mon.length-1][0] += `)`
                    }
                }
            }
            form.xml = await this.ReplacementTable(form.xml, params_list_mon, data_list_mon);
        }
        else {
            form.xml = await this.ReplacementParam(form.xml, "{list_mon}", ".....");
        }
        // Ввод {list_mon}

        // Ввод {c_art}
        let c_art = 0;
        for(let i = 0; i < publications.length; i++) {
            if(publications[i].publication_type_id == 8)
                c_art++;
        }
        if (c_art > 0)
            form.xml = await this.ReplacementParam(form.xml, "{c_art}", c_art);
        else form.xml = await this.ReplacementParam(form.xml, "{c_art}", "-");
        // Ввод {c_art}

        // Ввод {list_art}
        let params_list_art = ["{list_art}"];
        let data_list_art = [];
        if (c_art > 0) {
            for(let i = 0; i < publications.length; i++) {
                if(publications[i].publication_type_id == 8) {
                    data_list_art.push([]);
                    //console.log(publications[i]);
                    data_list_art[data_list_art.length-1][0] = `${data_list_art.length}. ${publications[i].authors} ${publications[i].title} // ${publications[i].journal}. ${publications[i].year}. С. ${publications[i].pages}`;
                }
            }
            form.xml = await this.ReplacementTable(form.xml, params_list_art, data_list_art);
        }
        else {
            form.xml = await this.ReplacementParam(form.xml, "{list_art}", ".....");
        }
        // Ввод {list_art}

        // Ввод {c_pub2}
        let c_pub2 = 0;
        for(let i = 0; i < publications.length; i++) {
            if(publications[i].publication_type_id == 2)
                c_pub2++;
        }
        if (c_pub2 > 0)
            form.xml = await this.ReplacementParam(form.xml, "{c_pub2}", c_pub2);
        else form.xml = await this.ReplacementParam(form.xml, "{c_pub2}", "-");
        // Ввод {c_pub2}

        // Ввод {list_pub2}
        let params_list_pub2 = ["{list_pub2}"];
        let data_list_pub2 = [];
        if (c_pub2 > 0) {
            for(let i = 0; i < publications.length; i++) {
                if(publications[i].publication_type_id == 2) {
                    data_list_pub2.push([]);
                    //console.log(publications[i]);
                    data_list_pub2[data_list_pub2.length-1][0] = `${data_list_pub2.length}. ${publications[i].authors} ${publications[i].title} // ${publications[i].journal}. ${publications[i].year}. С. ${publications[i].pages}`;

                    let dost = [];
                    if(publications[i].is_wos) {
                        let wos = `Web of Science`;
                        if(publications[i].quartile != null) {
                            if(publications[i].quartile != "Q5")
                                wos += ` ${publications[i].quartile}`;
                            else wos += ` ESCI`;
                        }
                        dost.push(wos);
                    }
                    if(publications[i].is_scopus) {
                        let scopus = `Scopus`;
                        if(publications[i].quartile_scopus != null)
                            scopus += ` ${publications[i].quartile_scopus}`;
                        dost.push(scopus);
                    }
                    if(publications[i].is_risc) {
                        let risc = `РИНЦ`;
                        dost.push(risc);
                    }
                    if(publications[i].is_wl) {
                        let wl = `Белый список`;
                        if(publications[i].quartile_wl != null)
                            wl += ` ${publications[i].quartile_wl}`;
                        dost.push(wl);
                    }
                    if(publications[i].is_vak) {
                        let vak = `ВАК`;
                        if(publications[i].quartile_vak != null)
                            vak += ` ${publications[i].quartile_vak}`;
                        dost.push(vak);
                    }
                    
                    if(dost.length > 0) {
                        data_list_pub2[data_list_pub2.length-1][0] += ` (`
                        for(let i = 0; i < dost.length; i++) {
                            data_list_pub2[data_list_pub2.length-1][0] += `${dost[i]}`;
                            if(i != (dost.length-1))
                                data_list_pub2[data_list_pub2.length-1][0] += `,`;
                        }
                        data_list_pub2[data_list_pub2.length-1][0] += `)`
                    }
                }
            }
            form.xml = await this.ReplacementTable(form.xml, params_list_pub2, data_list_pub2);
        }
        else {
            form.xml = await this.ReplacementParam(form.xml, "{list_pub2}", ".....");
        }
        // Ввод {list_pub2}

        // Ввод {c_pat}
        let c_pat = 0;
        for(let i = 0; i < publications.length; i++) {
            if(publications[i].publication_type_id == 3)
                c_pat++;
        }
        if (c_pat > 0)
            form.xml = await this.ReplacementParam(form.xml, "{c_pat}", c_pat);
        else form.xml = await this.ReplacementParam(form.xml, "{c_pat}", "-");
        // Ввод {c_pat}

        // Ввод {list_pat}
        let params_list_pat = ["{list_pat}"];
        let data_list_pat = [];
        if (c_pat > 0) {
            for(let i = 0; i < publications.length; i++) {
                if(publications[i].publication_type_id == 3) {
                    data_list_pat.push([]);
                    //console.log(publications[i]);
                    data_list_pat[data_list_pat.length-1][0] = `${data_list_pat.length}. ${publications[i].authors} ${publications[i].title} // ${publications[i].journal}. ${publications[i].year}. С. ${publications[i].pages}`;
                }
            }
            form.xml = await this.ReplacementTable(form.xml, params_list_pat, data_list_pat);
        }
        else {
            form.xml = await this.ReplacementParam(form.xml, "{list_pat}", ".....");
        }
        // Ввод {list_pat}

        // Ввод {c_pub3}
        form.xml = await this.ReplacementParam(form.xml, "{c_pub3}", "-");
        // Ввод {c_pub3}

        // Ввод {list_pub3}
        form.xml = await this.ReplacementParam(form.xml, "{list_pat3}", ".....");
        // Ввод {list_pub3}

        // Ввод {c_pre}
        form.xml = await this.ReplacementParam(form.xml, "{c_pre}", "-");
        // Ввод {c_pre}

        // Ввод {list_pre}
        form.xml = await this.ReplacementParam(form.xml, "{list_pre}", ".....");
        // Ввод {list_pre}

        // Ввод {c_book}
        form.xml = await this.ReplacementParam(form.xml, "{c_book}", "-");
        // Ввод {c_book}

        // Ввод {list_book}
        form.xml = await this.ReplacementParam(form.xml, "{list_book}", ".....");
        // Ввод {list_book}

        // Ввод {c_pub4}
        let c_pub4 = 0;
        for(let i = 0; i < publications.length; i++) {
            if(publications[i].publication_type_id == 7)
                c_pub4++;
        }
        if (c_pub4 > 0)
            form.xml = await this.ReplacementParam(form.xml, "{c_pub4}", c_pat);
        else form.xml = await this.ReplacementParam(form.xml, "{c_pub4}", "-");
        // Ввод {c_pub4}

        // Ввод {list_pub4}
        let params_list_pub4 = ["{list_pub4}"];
        let data_list_pub4 = [];
        if (c_pub4 > 0) {
            for(let i = 0; i < publications.length; i++) {
                if(publications[i].publication_type_id == 7) {
                    data_list_pub4.push([]);
                    //console.log(publications[i]);
                    data_list_pub4[data_list_pub4.length-1][0] = `${data_list_pub4.length}. ${publications[i].authors} ${publications[i].title} // ${publications[i].journal}. ${publications[i].year}. С. ${publications[i].pages}`;
                }
            }
            form.xml = await this.ReplacementTable(form.xml, params_list_pub4, data_list_pub4);
        }
        else {
            form.xml = await this.ReplacementParam(form.xml, "{list_pub4}", ".....");
        }
        // Ввод {list_pub4}
        //console.log(form.xml);
        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async GenerateForm33(message, key, path) {
        let form = await this.GenerateForm(path);

        // Данные для переменных
        let request = await Mysql.Request(`SELECT name, surname, middlename FROM users WHERE id = ${message.author_id}`);
        const date = new Date();
        const date2 = date.toJSON();
        const date_write = date2.substr(8, 2) + '.' + date2.substr(5, 2) + '.' + date2.substr(0, 4);
        // Данные для переменных

        // Изменение переменных
        form.xml = await this.ReplacementParam(form.xml, "{fio}", `${request[0].surname} ${request[0].name} ${request[0].middlename}`); 
        form.xml = await this.ReplacementParam(form.xml, "{date}", date_write);
        // Изменение переменных

        // Данные для таблиц
        let params = ["{counter}", "{name}", "{type}", "{data}", "{volume}", "{authors}"];
        request = await Mysql.Request(`SELECT count_pages, pages, volume, number, publication_type_id, number, year, title, journal, authors FROM bree7e_cris_publications where id in (SELECT publication_id FROM bree7e_cris_authors_publications where rb_author_id = ${message.author_id} and reportYear >= ${message.from_year} and reportYear <= ${message.to_year});`);
        let publications_info = await Mysql.Request(`SELECT id,name FROM bree7e_cris_publication_types`);
        for (let i in request) {
            if (request[i].publication_type_id == 1) {
                if(request[i].year) request[i].journal += ` ${request[i].year}.`;
                if(request[i].volume) request[i].journal += ` Vol.${request[i].volume}.`;
                if(request[i].number) request[i].journal += ` №${request[i].number}.`;
                if(request[i].pages) request[i].journal += ` ${request[i].pages}с.`;
            }
            else if (request[i].publication_type_id == 2) {
                if(request[i].year) request[i].journal += ` ${request[i].year}.`;
            }
            else if (request[i].publication_type_id == 3) {
                request[i].journal = `${request[i].title}: Свидетельство о государственной регистрации программ для ЭВМ №${request[i].number} М.: Федеральная служба по интеллектуальной собственности, патентам и товарным знакам, ${request[i].year}`;
            }

            if (!request[i].count_pages) request[i].count_pages = "Не указано";

            for(let j in publications_info) if (publications_info[j].id == request[i].publication_type_id) request[i].publication_name = publications_info[j].name;


        };
        let data = [];
        for (let i = 0; i < request.length; i++) {
            data[i] = [];
            data[i][0] = i + 1;
            data[i][1] = request[i].title;
            data[i][2] = request[i].publication_name;
            data[i][3] = request[i].journal;
            data[i][4] = request[i].count_pages;
            data[i][5] = request[i].authors;
        }
        // Данные для таблиц

        // Изменение таблиц
        form.xml = await this.ReplacementTable(form.xml, params, data);
        // Изменение таблиц

        key = await this.SaveForm(form, key, null, null, null);
        return key;
    }

    static async ReplacementTable(xml, params, data) {
        let xml_tr;
        let index_start = xml.indexOf(params[0]);
        let index_tr = xml.lastIndexOf("<w:tr ", index_start);
        let index_tr_end = xml.indexOf("</w:tr>", index_start);
        while (index_tr != -1) {
            if (xml.indexOf(params[0], index_tr) != -1 && xml.indexOf(params[0], index_tr) < index_tr_end) {
                xml_tr = xml.slice(index_tr, index_tr_end + 7)
                break;
            }
            index_tr = xml.indexOf("<w:tr ", index_tr + 1);
            index_tr_end = xml.indexOf("</w:tr>", index_tr_end + 1);
        }
        xml = xml.slice(0, index_tr) + xml.slice(index_tr_end + 1);
        let index = index_tr;
        for (let i = 0; i < data.length; i++) {
            let xml_tr_shb = xml_tr;
            for (let i2 = 0; i2 < data[i].length; i2++) {
                xml_tr_shb = await this.ReplacementParam(xml_tr_shb, params[i2], data[i][i2]);
            }
            xml = xml.slice(0, index) + xml_tr_shb + xml.slice(index);
            index += xml_tr_shb.length;
        }
        return xml;
    }

    static async ReplacementParam(xml, param, text) {
        text += ""; //Преобразование переменной text в String
        // Проверка на наличие param в xml
        if (xml.indexOf(param) == -1) return xml;
        // Исправление амперсанда, чтобы не выдавал ошибку в docx документе
        if (text.indexOf("&") != -1) {
            text = text.replace(new RegExp("&", 'g'), `&amp;`);
        }
        return xml.replace(new RegExp(param, 'g'), `${text}`);
    }

    static async ProcessingXml(xml) {
        let index = xml.indexOf("{");
        while (index != -1) {
            let brace_0 = xml.indexOf("{", index + 1);
            let brace_1 = xml.indexOf("}", index + 1);
            if (brace_0 > brace_1 || brace_0 == -1 && brace_1 != -1) {
                while (xml.indexOf("<", index) < xml.indexOf("}", index + 1) && xml.indexOf("<", index) != -1) {
                    xml = xml.slice(0, xml.indexOf("<", index)) + xml.slice(xml.indexOf(">", index) + 1);
                }
            }
            index = xml.indexOf("{", index + 1);
        }
        return xml;
    }

    static async GenerateForm(path) {
        let form = new AdmZip(path);
        form.forEach(function (formEach) {
            if (formEach.entryName == "word/document.xml") {
                form.xml = formEach.getData().toString();
            }
        });
        form.xml = await this.ProcessingXml(form.xml);
        return form;
    }

    static async SaveForm(form, key, attachment_type, field, attachment_id) {
        let parts_name = ['671','72c','aae',`${(new Date).getTime()}`];
        let disk_name = `${parts_name[0]+parts_name[1]+parts_name[2]+parts_name[3]}.docx`;
        let file_name = `${key}.docx`;
        let path = `${this.MAIN_PATH}/storage/app/uploads/public/${parts_name[0]}/${parts_name[1]}/${parts_name[2]}`;
        let created_at = await MyDate.DateMysqlTimeStamp(new Date());

        form.updateFile("word/document.xml", form.xml);
        form.writeZip(`${path}/${disk_name}`);
        let file_stats = fs.statSync(`${path}/${disk_name}`);

        if(attachment_type != null && field != null && attachment_id != null)
            await Mysql.Request(`DELETE FROM system_files WHERE attachment_type='${attachment_type}' AND field='${field}' AND attachment_id=${attachment_id}`);
        let system_file = await Mysql.Request(`INSERT INTO system_files(disk_name, file_name, file_size, content_type, field, attachment_id, attachment_type, is_public, created_at, updated_at) VALUES('${disk_name}', '${file_name}', ${file_stats.size}, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '${field}', ${attachment_id}, '${attachment_type}', 1, '${created_at}', '${created_at}')`);
        await Mysql.Request(`UPDATE system_files SET sort_order=${system_file.insertId} WHERE id=${system_file.insertId}`);
        
        key = `${parts_name[0]}/${parts_name[1]}/${parts_name[2]}/${disk_name}`;
        //let file = {key: key, name: file_name};
        
        return key;
    }

    static async GenerateKey(message) {
        let key;
        if (message.form == 33 || message.form == '33') {
            if (typeof message.author_id == 'undefined' || typeof message.from_year == 'undefined' || typeof message.to_year == 'undefined')
                key = "Error";
            else {
                let request = await Mysql.Request(`SELECT surname FROM users WHERE id = ${message.author_id}`);
                let surnameEU = await WordTransliteration.Transliteration(request[0].surname, "RU", "EU");
                key = `${message.form}_${surnameEU}_${message.from_year}_${message.to_year}`;
            }
        } else {
            key = "Error";
        }
        return key;
    }

    static async GetAuthorReference(id_author_reference) {
        let author_reference = (await Mysql.Request(`SELECT * FROM bree7e_cris_author_references WHERE id=${id_author_reference}`))[0];

        if(typeof author_reference == 'undefined') {
            return null;
        }

        if(!author_reference.authors_str) author_reference.authors_str = '';
        if(!author_reference.positions_str) author_reference.positions_str = '';
        if(!author_reference.id_publication_type) author_reference.publication_type = '';
        else author_reference.publication_type = (await Mysql.Request(`SELECT name FROM bree7e_cris_publication_types WHERE id=${author_reference.id_publication_type}`))[0].name;
        if(!author_reference.full_name_publication) author_reference.full_name_publication = '';
        if(!author_reference.count_pages) author_reference.count_pages = '';
        if(!author_reference.count_images) author_reference.count_images = '';
        if(!author_reference.inventions) author_reference.inventions = '';
        if(!author_reference.NIR) author_reference.NIR = '';
        if(!author_reference.information) author_reference.information = '';
        if(!author_reference.id_commission) {
            author_reference.id_commission = null;
            author_reference.commission = {};
            author_reference.commission.president = {};
            author_reference.commission.president.fio = "";
            author_reference.commission.president.iof = "";
            author_reference.commission.inspector = {};
            author_reference.commission.inspector.fio = "";
            author_reference.commission.inspector.iof = "";
        } else {
            author_reference.commission = (await Mysql.Request(`SELECT * FROM bree7e_cris_commissions WHERE id=${author_reference.id_commission}`))[0];
            author_reference.commission.president = (await Mysql.Request(`SELECT * FROM users WHERE id=${author_reference.commission.id_president}`))[0];
            author_reference.commission.president.fio = `${author_reference.commission.president.surname} ${author_reference.commission.president.name[0]}.${author_reference.commission.president.middlename[0]}.`;
            author_reference.commission.president.iof = `${author_reference.commission.president.name[0]}.${author_reference.commission.president.middlename[0]}. ${author_reference.commission.president.surname}`;
            author_reference.commission.inspector = (await Mysql.Request(`SELECT * FROM users WHERE id=${author_reference.commission.id_inspector}`))[0];
            author_reference.commission.inspector.fio = `${author_reference.commission.inspector.surname} ${author_reference.commission.inspector.name[0]}.${author_reference.commission.inspector.middlename[0]}.`;
            author_reference.commission.inspector.iof = `${author_reference.commission.inspector.name[0]}.${author_reference.commission.inspector.middlename[0]}. ${author_reference.commission.inspector.surname}`;
        }
        if(!author_reference.id_commission_member) author_reference.id_commission_member = null;
        if(!author_reference.id_commission_patent_member) author_reference.id_commission_patent_member = null;
        if(!author_reference.id_commission_member_) {
            author_reference.id_commission_member_ = null;
            author_reference.commission_member = {};
            author_reference.commission_member.fio = "";
            author_reference.commission_member.iof = "";
        } else {
            author_reference.commission_member = (await Mysql.Request(`SELECT * FROM users WHERE id=${author_reference.id_commission_member_}`))[0];
            author_reference.commission_member.fio = `${author_reference.commission_member.surname} ${author_reference.commission_member.name[0]}.${author_reference.commission_member.middlename[0]}.`;
            author_reference.commission_member.iof = `${author_reference.commission_member.name[0]}.${author_reference.commission_member.middlename[0]}. ${author_reference.commission_member.surname}`;
        }
        if(!author_reference.id_commission_patent_member_) {
            author_reference.id_commission_patent_member_ = null;
            author_reference.commission_patent_member = {};
            author_reference.commission_patent_member.fio = "";
            author_reference.commission_patent_member.iof = "";
        } else {
            author_reference.commission_patent_member = (await Mysql.Request(`SELECT * FROM users WHERE id=${author_reference.id_commission_patent_member_}`))[0];
            author_reference.commission_patent_member.fio = `${author_reference.commission_patent_member.surname} ${author_reference.commission_patent_member.name[0]}.${author_reference.commission_patent_member.middlename[0]}.`;
            author_reference.commission_patent_member.iof = `${author_reference.commission_patent_member.name[0]}.${author_reference.commission_patent_member.middlename[0]}. ${author_reference.commission_patent_member.surname}`;
        }
        if(!author_reference.export_country) author_reference.export_country = '';
        if(!author_reference.export_event) author_reference.export_event = '';
        if(!author_reference.export_date) author_reference.export_date = '';
        if(!author_reference.purpose_call) author_reference.purpose_call = '';
        if(!author_reference.id_author) {
            author_reference.id_author = null;
            author_reference.author = {};
            author_reference.author.fio = '';
        }
        else {
            author_reference.author = (await Mysql.Request(`SELECT * FROM users WHERE id=${author_reference.id_author}`))[0];
            author_reference.author.fio = `${author_reference.author.surname} ${author_reference.author.name[0]}.${author_reference.author.middlename[0]}.`;
            author_reference.author.iof = `${author_reference.author.name[0]}.${author_reference.author.middlename[0]}. ${author_reference.author.surname}`;
        }
        if(!author_reference.id_zav_lab_otdel) {
            author_reference.id_zav_lab_otdel = null;
            author_reference.zav_lab_otdel = {};
            author_reference.zav_lab_otdel.fio = '';
            author_reference.zav_lab_otdel.iof = '';
        }
        else {
            author_reference.zav_lab_otdel = (await Mysql.Request(`SELECT * FROM users WHERE id=${author_reference.id_zav_lab_otdel}`))[0];
            author_reference.zav_lab_otdel.fio = `${author_reference.zav_lab_otdel.surname} ${author_reference.zav_lab_otdel.name[0]}.${author_reference.zav_lab_otdel.middlename[0]}.`;
            author_reference.zav_lab_otdel.iof = `${author_reference.zav_lab_otdel.name[0]}.${author_reference.zav_lab_otdel.middlename[0]}. ${author_reference.zav_lab_otdel.surname}`;
        }
        if(!author_reference.material) author_reference.material = 'не указано';

        return author_reference;
    }
}

//-----------Экспортируемые модули-----------//
module.exports = Docx;
//-----------Экспортируемые модули-----------//

            /*let digits = request[i].pages.match(/\d+/g);
            if(!digits) request[i].pages = "Не указано";
            else if(digits.length == 1) request[i].pages = 1;
            else request[i].pages = digits[1]-digits[0]+1;*/