# -*- coding: utf-8 -*-

import requests
import io
import zipfile
import xml.etree.ElementTree as et
from datetime import datetime
from pytz import timezone
from app.models import Configuration


def available_configurations():
    return [{'project':conf.project, 'name':conf.name, 'edition':conf.edition, 'description':conf.description} for conf in Configuration.query.all()]


def current_configuration_releases():
    result = {'Data': None, 'Error': False, 'TextError': ''}

    list_releases_configurations = []
    for dict_config in available_configurations():
        data_configuration = current_configuration_release(dict_config)
        if data_configuration['Error']:
            return data_configuration
        list_releases_configurations.append(data_configuration['Data'])

    result['Data'] = list_releases_configurations

    return result


def current_configuration_release(dict_config):
    result = {'Data': None, 'Error': False, 'TextError': ''}

    url = '%s/ipp/ITSREPV/V8Update/Configs/%s/%s/83/UpdInfo.txt' % (
        'http://downloads.1c.ru', dict_config['name'], dict_config['edition'])
    res = requests.get(url)
    res.encoding = 'utf_8_sig'

    list_res = res.text.splitlines()
    version = list_res[0].replace('Version=', '')
    from_versions = list_res[1].replace('FromVersions=', '')
    update_date = list_res[2].replace('UpdateDate=', '')

    update_date_iso = converting_date_iso(update_date)

    result['Data'] = {'Conf': dict_config, 'Version': version, 'FromVersions': from_versions,
                      'UpdateDate': update_date_iso}
    return result


def converting_date_iso(date_str):
    time_zone = 'Europe/Moscow'
    date_update = datetime.strptime(date_str, '%d.%m.%Y')
    date_update_tz = timezone(time_zone).localize(date_update, is_dst=None)
    return date_update_tz.isoformat()


def configuration_release_table(project):
    result = {'Data': None, 'Error': False, 'TextError': '', 'DataCount': 0}

    all_configurations = {dict_config['project']: dict_config for dict_config in available_configurations()}

    if project not in all_configurations:
        result['TextError'] = 'Конфигурация не найдена'
        result['Error'] = True
        return result

    dict_config = all_configurations[project]

    result['Data'] = load_v8upd11_zip(dict_config['name'], dict_config['edition'])

    return result


def load_v8upd11_zip(name, edition):
    list_release = []

    url = '%s/ipp/ITSREPV/V8Update/Configs/%s/%s/83/v8upd11.zip' % ('http://downloads.1c.ru', name, edition)
    res = requests.get(url)

    with zipfile.ZipFile(io.BytesIO(res.content)) as thezip:
        for zipinfo in thezip.infolist():
            with thezip.open(zipinfo) as thefile:
                file_bites = io.BytesIO(thefile.read())

                space_name = '{http://v8.1c.ru/configuration-updates}'
                tree = et.parse(file_bites)
                root_tree = tree.getroot()
                for child in root_tree:
                    if space_name + 'update' != child.tag:
                        continue
                    dir_release = {}
                    for grandchild in child:
                        if space_name + 'vendor' == grandchild.tag:
                            dir_release['vendor'] = grandchild.text
                        elif space_name + 'version' == grandchild.tag:
                            dir_release['version'] = grandchild.text
                        elif space_name + 'file' == grandchild.tag:
                            dir_release['file'] = grandchild.text
                        elif space_name + 'size' == grandchild.tag:
                            dir_release['size'] = grandchild.text
                        elif space_name + 'target' == grandchild.tag:
                            if 'target' in dir_release:
                                dir_release['target'] = dir_release['target'] + ';' + grandchild.text
                            else:
                                dir_release['target'] = grandchild.text
                    list_release.append(dir_release)

    return list_release[::-1]


def external_ref():
    list_ref = list()
    list_ref.append(
        {'href': 'https://releases.1c.ru/total', 'title': 'Доступ по подписке', 'text': '1C:Обновление программ'})
    list_ref.append(
        {'href': 'http://v8.1c.ru/lawmonitor/lawchanges.jsp', 'title': '', 'text': 'Новости законодательства от "1С"'})
    list_ref.append({'href': 'https://its.1c.ru', 'title': '', 'text': 'ИТС'})
    list_ref.append({'href': 'https://its.1c.ru/db/updinfo', 'title': '',
                     'text': 'Информация об обновлениях программных продуктов 1С:Предприятие'})
    list_ref.append({'href': 'https://buh.ru/news/', 'title': '', 'text': 'Новости (buh.ru)'})
    list_ref.append({'href': 'https://zen.yandex.ru/buh.ru/', 'title': '', 'text': 'Бухгалтерский ДЗЕН'})
    list_ref.append({'href': 'https://buh.ru/calendar/', 'title': '', 'text': 'Производственный календарь'})
    list_ref.append({'href': 'https://buh.ru/calendar-nalog/', 'title': '', 'text': 'Календарь бухгалтера'})
    list_ref.append({'href': 'https://its.1c.ru/db/answers1c', 'title': '', 'text': 'Ответы на вопросы по программам 1С'})
    list_ref.append({'href': soft_ref(), 'title': '', 'text': 'Полезный софт', 'group': True})
    return list_ref


def soft_ref():
    list_ref = list()
    list_ref.append(
        {'href': 'https://www.teamviewer.com/', 'title': 'Программы удалённого подключения/администрирования',
         'text': 'TeamViewer'})
    list_ref.append({'href': 'https://notepad-plus-plus.org/',
                     'title': 'Текстовый редактор с подсветкой синтаксиса большого количества языков программирования и разметки',
                     'text': 'Notepad++'})
    list_ref.append({'href': 'http://app.prntscr.com/', 'title': 'Самый быстрый и удобный способ сделать скриншот',
                     'text': 'Lightshot'})
    list_ref.append(
        {'href': 'https://helpme1c.ru/obnovlyator-1s-gruppovoe-paketnoe-obnovlenie-vsex-baz-za-odin-raz', 'title': '',
         'text': 'Обновлятор-1С'})
    list_ref.append({'href': 'https://forum.ruboard.ru/showthread.php/248879',
                     'title': 'Выложенные программные продукты в целях ознакомления для зарегистрированных пользователей фирмы 1С.',
                     'text': 'RuBoard'})
    return list_ref
