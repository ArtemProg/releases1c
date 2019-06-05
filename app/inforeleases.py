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
    # return Configuration.query.all()
    # configurations = list()
#     configurations.append(
#         dict_configuration('Accounting20_82', 'Accounting', '20', 'Бухгалтерия предприятия, редакция 2.0'))
#     configurations.append(
#         dict_configuration('AccountingCorp', 'AccountingCorp', '20', 'Бухгалтерия предприятия КОРП, редакция 2.0'))
#     configurations.append(
#         dict_configuration('AccountingBase30', 'AccountingBase', '30', 'Бухгалтерия предприятия базовая, редакция 3.0'))
#     configurations.append(
#         dict_configuration('Accounting30', 'Accounting', '30', 'Бухгалтерия предприятия, редакция 3.0'))
#     configurations.append(
#         dict_configuration('AccountingCorp30', 'AccountingCorp', '30', 'Бухгалтерия предприятия КОРП, редакция 3.0'))
#     configurations.append(
#         dict_configuration('DocMngCorp', 'DocMngCorp', '21', 'Документооборот КОРП, редакция 2.1'))
#     configurations.append(
#         dict_configuration('DocMng', 'DocMng', '21', 'Документооборот ПРОФ, редакция 2.1'))
#     configurations.append(
#         dict_configuration('HRMBase30', 'HRMBase', '31', 'Зарплата и Управление Персоналом базовая, редакция 3'))
#     configurations.append(
#         dict_configuration('HRM30', 'HRM', '31', 'Зарплата и Управление Персоналом, редакция 3'))
#     configurations.append(
#         dict_configuration('HRMCorp', 'HRMCorp', '25', 'Зарплата и Управление Персоналом КОРП, редакция 2.5'))
#     configurations.append(
#         dict_configuration('HRMCorp30', 'HRMCorp', '31', 'Зарплата и Управление Персоналом КОРП, редакция 3'))
#     configurations.append(
#         dict_configuration('ARAutomation11', 'ARAutomation', '11', 'Комплексная автоматизация, редакция 1.1'))
#     configurations.append(
#         dict_configuration('ARAutomation20', 'ARAutomation', '24', 'Комплексная автоматизация, редакция 2'))
#     configurations.append(
#         dict_configuration('Taxes', 'Taxes', '30', 'Налогоплательщик'))
#     configurations.append(
#         dict_configuration('RetailBase22', 'RetailBase', '22', 'Розница базовая, редакция 2.2'))
#     configurations.append(
#         dict_configuration('Retail22', 'Retail', '22', 'Розница, редакция 2.2'))
#     configurations.append(
#         dict_configuration('Enterprise13', 'Enterprise', '13', 'Управление производственным предприятием, редакция 1.3'))
#     configurations.append(
#         dict_configuration('TradeBase', 'TradeBase', '103', 'Управление торговлей базовая, редакция 10.3'))
#     configurations.append(
#         dict_configuration('Trade103', 'Trade', '103', 'Управление торговлей, редакция 10.3'))
#     configurations.append(
#         dict_configuration('TradeBase110', 'TradeBase', '114', 'Управление торговлей базовая, редакция 11'))
#     configurations.append(
#         dict_configuration('Trade110', 'Trade', '114', 'Управление торговлей, редакция 11'))
#     configurations.append(
#         dict_configuration('EnterpriseERP20', 'Enterprise20', '24', '1С:ERP Управление предприятием 2'))
#
#     return configurations
#
#
# def dict_configuration(configuration, name, edition, presentation):
#     return {'configuration': configuration, 'name': name, 'edition': edition, 'presentation': presentation}


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
