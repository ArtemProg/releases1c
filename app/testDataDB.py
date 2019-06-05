from app import app, db
from app.models import Configuration


def add_data_db():
    configurations = Configuration.query.all()
    for conf in configurations:
        db.session.delete(conf)
    db.session.commit()

    for dict_conf in available_configurations():
        conf = Configuration(**dict_conf)
        db.session.add(conf)
    db.session.commit()


def available_configurations():
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


add_data_db()