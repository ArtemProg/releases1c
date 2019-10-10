# -*- coding: utf-8 -*-

import requests
from datetime import datetime
from pytz import timezone, utc
from app import db
from app.models import Configuration, Release


def setting_configurations():
    configurations = list()
    configurations.append(
        dict_configuration('Accounting20_82', 'Accounting', '20', 'Бухгалтерия предприятия, редакция 2.0'))
    configurations.append(
        dict_configuration('AccountingCorp', 'AccountingCorp', '20', 'Бухгалтерия предприятия КОРП, редакция 2.0'))
    configurations.append(
        dict_configuration('AccountingBase30', 'AccountingBase', '30', 'Бухгалтерия предприятия базовая, редакция 3.0'))
    configurations.append(
        dict_configuration('Accounting30', 'Accounting', '30', 'Бухгалтерия предприятия, редакция 3.0'))
    configurations.append(
        dict_configuration('AccountingCorp30', 'AccountingCorp', '30', 'Бухгалтерия предприятия КОРП, редакция 3.0'))
    configurations.append(
        dict_configuration('DocMngCorp', 'DocMngCorp', '21', 'Документооборот КОРП, редакция 2.1'))
    configurations.append(
        dict_configuration('DocMng', 'DocMng', '21', 'Документооборот ПРОФ, редакция 2.1'))
    configurations.append(
        dict_configuration('HRMBase30', 'HRMBase', '31', 'Зарплата и Управление Персоналом базовая, редакция 3'))
    configurations.append(
        dict_configuration('HRM30', 'HRM', '31', 'Зарплата и Управление Персоналом, редакция 3'))
    configurations.append(
        dict_configuration('HRMCorp', 'HRMCorp', '25', 'Зарплата и Управление Персоналом КОРП, редакция 2.5'))
    configurations.append(
        dict_configuration('HRMCorp30', 'HRMCorp', '31', 'Зарплата и Управление Персоналом КОРП, редакция 3'))
    configurations.append(
        dict_configuration('ARAutomation11', 'ARAutomation', '11', 'Комплексная автоматизация, редакция 1.1'))
    configurations.append(
        dict_configuration('ARAutomation20', 'ARAutomation', '24', 'Комплексная автоматизация, редакция 2'))
    configurations.append(
        dict_configuration('Taxes', 'Taxes', '30', 'Налогоплательщик'))
    configurations.append(
        dict_configuration('RetailBase22', 'RetailBase', '22', 'Розница базовая, редакция 2.2'))
    configurations.append(
        dict_configuration('Retail22', 'Retail', '22', 'Розница, редакция 2.2'))
    configurations.append(
        dict_configuration('Enterprise13', 'Enterprise', '13', 'Управление производственным предприятием, редакция 1.3'))
    configurations.append(
        dict_configuration('TradeBase', 'TradeBase', '103', 'Управление торговлей базовая, редакция 10.3'))
    configurations.append(
        dict_configuration('Trade103', 'Trade', '103', 'Управление торговлей, редакция 10.3'))
    configurations.append(
        dict_configuration('TradeBase110', 'TradeBase', '114', 'Управление торговлей базовая, редакция 11'))
    configurations.append(
        dict_configuration('Trade110', 'Trade', '114', 'Управление торговлей, редакция 11'))
    configurations.append(
        dict_configuration('EnterpriseERP20', 'Enterprise20', '24', '1С:ERP Управление предприятием 2'))

    return configurations


def dict_configuration(project, name, edition, description):
    return {'project': project, 'name': name, 'edition': edition, 'description': description}


def current_configuration_release(conf):
    url = '%s/ipp/ITSREPV/V8Update/Configs/%s/%s/83/UpdInfo.txt' % (
        'http://downloads.1c.ru', conf.name, conf.edition)
    res = requests.get(url)
    if res.status_code != 200:
        log(url)
        log(str(res.status_code) + '; ' + res.reason)
        return None
    try:
        res.encoding = 'utf_8_sig'

        list_res = res.text.splitlines()
        version = list_res[0].replace('Version=', '')
        from_versions = list_res[1].replace('FromVersions=', '')
        update_date = list_res[2].replace('UpdateDate=', '')

        date = timezone('Europe/Moscow').localize(datetime.strptime(update_date, '%d.%m.%Y'), is_dst=None)
        date_utc = date.astimezone(utc)

        return {'version': version, 'from_versions': from_versions, 'date': date_utc}
    except Exception as ex:
        log(url)
        log(str(ex))


def add_release(conf, data_release):
    if conf.releases.filter_by(version=data_release['version']).first() is None:
        release = Release(version=data_release['version'], date=data_release['date'],
                          from_versions=data_release['from_versions'], configuration=conf)
        db.session.add(release)
        db.session.commit()
        log('LOAD: {}'.format(release))


def log(text):
    try:
        with open('logInfo.log', 'a') as outFile:
            outFile.write('\n' + str(datetime.now()) + '   ' + text)
    except:
        pass


def start():
    log('START')

    if Configuration.query.first() is None:
        log('save setting_configurations')
        for dict_conf in setting_configurations():
            conf = Configuration(**dict_conf)
            db.session.add(conf)
        db.session.commit()

    log('load configurations')
    configurations = Configuration.query.filter_by(active=True).all()
    for conf in configurations:
        data_release = current_configuration_release(conf)
        if data_release is None:
            continue
        try:
            add_release(conf, data_release)
        except Exception as ex:
            log(str(ex))

    log('END')


start()
