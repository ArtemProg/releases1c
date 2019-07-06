
document.addEventListener("DOMContentLoaded", function () {

	// addEventListener {
	window.addEventListener('scroll', eventScrollWindow); // прокрутка страницы и активация нужного пункта меню
	document.querySelector('.hamburger').addEventListener('click', eventClickHamburger); // нажатие на гамбургер

	nav_page = document.querySelector('.nav-page');
	if (nav_page)  {
	    nav_page.addEventListener('click', eventClickNavLinkPage); // плавный скролл при клике навигации по странице
	}

	setting__select_configuration = document.querySelector('.setting__select-configuration');
	if (setting__select_configuration)  {
	    setting__select_configuration.addEventListener('change', eventChangeConfiguration);
	}

	setting__element__count_row_table = document.querySelector('.setting__element--count-row-table');
	if (setting__element__count_row_table) {
        setting__element__count_row_table.addEventListener('change', eventСhangeTableCountRow);
        setting__element__count_row_table.addEventListener('input', eventInputTableCountRow);
    }

	pagination = document.querySelector('.pagination');
	if (pagination) {
	    pagination.addEventListener('click', eventClickPaginationTable);
	}

	calculator_updates__box_setting = document.querySelector('.calculator-updates__box-setting');
	if (calculator_updates__box_setting) {
	    calculator_updates__box_setting.addEventListener('change', eventChangeSettingCalculatorUpdates);
	}

	[...document.querySelectorAll('.nav__menu-toggle')].map(el => el.addEventListener('click', eventClickNavGroup));
	// }

	eventScrollWindow(undefined);

	if (setting__select_configuration) {
	    runLoadConfigurations();
	}
	
});



// ************************************************************************************* //
// НАЧАЛО: ОБРАБОТЧИКИ СОБЫТИЙ

function eventClickHamburger(event) {
	toggleClass(document.querySelector('.panel-fixsed-left'), 'panel-fixsed-left--active');
}

function eventChangeConfiguration(event) {
	let el = event.target,
		textContent = el.selectedOptions[0].textContent;
	runLoadAllVersionsApplication(el.value, textContent);
}

function eventСhangeTableCountRow(event) {
	
	setCountRowTable(event.target);
	
	createUpdatePaginationTable('.all-versions-application');
}

function eventInputTableCountRow(event) {
	if (event.target.value.length > 3) {
		event.target.value = event.target.value.slice(0, 3);
	}
}

function eventClickPaginationTable(event) {
	
	event.preventDefault();
	
	let target = event.target;
	if (target.tagName == 'A') {
		makeTransitionPaginationTable(target);
	}
}

function eventChangeSettingCalculatorUpdates(event) {
	
	runCalculatorUpdates(event.target);
	
}

function eventClickNavLinkPage(event) {
	
	event.preventDefault();
	
	let target = event.target;
	if (target.tagName == 'A') {
		runAnimateScroll(target);
	}
}

function eventScrollWindow(event) {
	
	let scrolled = window.pageYOffset || document.documentElement.scrollTop,
		arrNavLink = document.querySelectorAll('.nav-page .nav__link'),
		delta = 200, // доп отступ сверху
		targetIndexLink = 0;

	if (!arrNavLink.length) {
	    window.removeEventListener('scroll', eventScrollWindow);
	    return;
	}

	for (let i = 0; i < arrNavLink.length; i++) {
		let elLink = arrNavLink[i],
			hash = elLink.href.replace(/[^#]*(.*)/, '$1'),
			offsetTop = document.querySelector(hash).offsetTop;
		if (offsetTop - delta >= scrolled) {
			break;
		}
		targetIndexLink = i;
	}
	
	let navClassItem = 'nav__item--active';
	
	let elActive = arrNavLink[targetIndexLink].parentElement,
		elActiveTarget = document.querySelector('.' + navClassItem);
	if (elActiveTarget) {
		if (elActive !== elActiveTarget) {
			elActiveTarget.classList.remove(navClassItem);
			elActive.classList.add(navClassItem);
		}
	} else {
		elActive.classList.add(navClassItem);
	}
	
}

function eventClickNavGroup(event) {
    let el = event.target,
        controlId = el.getAttribute('data-controls'),
        elControl = document.querySelector(controlId);
    toggleClass(elControl, 'nav__menu--close');
}

// КОНЕЦ: ОБРАБОТЧИКИ СОБЫТИЙ
// ************************************************************************************* //



// ************************************************************************************* //
// НАЧАЛО: AJAX ЗАПРОС

function runLoadConfigurations() {
	// Получаем все доступные конфигурации
	myRequest('configuration', loadConfigurations);
}

function runLoadCurrentVersionApplications() {
	// Получаем актуальные/последние релизы доступных конфигураций
	myRequest('configuration/UpdInfo', loadCurrentVersionApplications);
}

function runLoadAllVersionsApplication(project, textContent = '') {
	setAttributeSettingConfigurationLink(project, textContent);
	setCaptionTableCountVersion(0);
	setCalculatorUpdatesDefault();
	// Получаем все релизы выбранной конфигурации
	myRequest(project + '/v8upd11', loadAllVersionsApplication, [{project: project}]);
}

// КОНЕЦ: AJAX ЗАПРОС
// ************************************************************************************* //



// ************************************************************************************* //
// НАЧАЛО: РЕЗУЛЬТАТ AJAX ЗАПРОСА

function loadConfigurations(data, params) {
	// Получаем все доступные конфигурации
	if (!data) { return; }
	
	let settingConf = {},
		fragment = document.createDocumentFragment();
	
	data.forEach(function(item, index) {
		settingConf[item.project] = item;
		
		let selected = (index === 0);
		let elem = new Option(item.description, item.project, selected, selected);
		fragment.appendChild(elem);
	});
	
	document.querySelector('.setting__select-configuration').appendChild(fragment);

	Window.settingConf = settingConf;

	//runLoadCurrentVersionApplications();
	runLoadAllVersionsApplication(data[0].project, data[0].description);
}

function loadCurrentVersionApplications(data, params) {
	// Получаем актуальные/последние релизы доступных конфигураций
	if (!data) { return; }
	
	if (data.Error) {
		/* офрмить вывод сообщения об ошибке */
		//document.querySelector('.error').classList.remove('hidden');
		console.log(data.TextError);
		return;
	}
	
	let fragment = document.createDocumentFragment();
	
	data.Data.forEach(function(item, index) {
		let presentationConf  = item.Conf.description,
			configurationConf = item.Conf.project,
			nameConf          = item.Conf.name,
			editionConf       = item.Conf.edition,
			version      = item.Version,
			updateDate   = item.UpdateDate,
			fromVersions = item.FromVersions;
		
		//*************************************************
		let arrEl = [];
		arrEl.push( { modifier: 'number-row', el: document.createTextNode(index + 1) } ); // №
		arrEl.push( { modifier: 'name-head', el: createElLink(linkConfiguration(configurationConf), presentationConf) } ); // Название
		arrEl.push( { modifier: 'version-column', el: createElLink(linkConfigurationVersion(configurationConf, version), version) } ); // Актуальная версия - Номер версии
		arrEl.push( { modifier: 'release-date', el: createElTextDate(updateDate) } ); // Актуальная версия - Дата выхода
		//arrEl.push( { modifier: 'info-update', el: createElLink(linkNews(nameConf, editionConf), 'news') } ); // Актуальная версия - Новое в версии
		arrEl.push( { modifier: 'info-update', el: createElLink(linkVersionNews(nameConf, version), 'news') } ); // Актуальная версия - Новое в версии
		arrEl.push( { modifier: 'previous-versions', el: createElPreviousVersions(configurationConf, fromVersions) } ); // Обновление версии
		
		let elTr = document.createElement('tr');
		elTr.classList.add('table__row');
		for (let i = 0; i < arrEl.length; i++) {
			let elTd = document.createElement('td');
			elTd.classList.add('table__cell');
			elTd.classList.add('table__cell--' + arrEl[i].modifier);
			elTd.appendChild(arrEl[i].el);
			elTr.appendChild(elTd);
		}
		fragment.appendChild(elTr);
		//*************************************************
		
	});
	
	let elTbody = document.querySelector('.current-version-applications');
	
	while(elTbody.rows.length > 0) {
		elTbody.deleteRow(0);
	}
	
	elTbody.appendChild(fragment);
}

function loadAllVersionsApplication(data, params) {
	// Получаем все релизы выбранной конфигурации
	if (!data) { return; };
	
	if (data.Error) {
		/* офрмить вывод сообщения об ошибке */
		//document.querySelector('.error').classList.remove('hidden');
		console.log(data.TextError);
		return;
	};
	
	let fragmentTbody = document.createDocumentFragment(),
		fragmentVersionList = document.createDocumentFragment(),
		configurationConf = params[0].project,
		nameConf          = Window.settingConf[configurationConf].name;
	
	data.Data.forEach(function(item, index) {
		let version     = item['version'],
			editionConf = item['target'],
			size        = item['size'];
		
		//*************************************************
		let arrEl = [];
		arrEl.push( { modifier: 'number-row', el: document.createTextNode(index + 1) } ); // №
		arrEl.push( { modifier: 'version-column', el: createElLink(linkConfigurationVersion(configurationConf, version), version) } ); // Номер версии
		arrEl.push( { modifier: 'info-update', el: createElLink(linkVersionNews(nameConf, version), 'news') } ); // Актуальная версия - Новое в версии
		arrEl.push( { modifier: 'previous-versions', el: createElPreviousVersions(configurationConf, editionConf) } ); // Обновление версии
		arrEl.push( { modifier: 'table__cell--size-file', el: document.createTextNode( convertationByteMbyte(size) ) } ); // Размер файла обновления (Мб)
		
		let elTr = document.createElement('tr');
		elTr.classList.add('table__row');
		for (let i = 0; i < arrEl.length; i++) {
			let elTd = document.createElement('td');
			elTd.classList.add('table__cell');
			elTd.classList.add('table__cell--' + arrEl[i].modifier);
			elTd.appendChild(arrEl[i].el);
			elTr.appendChild(elTd);
		};
		fragmentTbody.appendChild(elTr);
		//*************************************************
		
		let selected = (index == 0);
		fragmentVersionList.appendChild( new Option(version, version, selected, selected) );
		
	});
	
	let elTbody = document.querySelector('.all-versions-application'),
		elVersionInitial = document.querySelector('.calculator-updates__version-initial'),
		elVersionFinal = document.querySelector('.calculator-updates__version-final');
	
	while(elTbody.rows.length > 0) {
		elTbody.deleteRow(0);
	};
	
	elTbody.setAttribute('data-count', data.Data.length);
	elTbody.appendChild(fragmentTbody);
	
	while(elVersionInitial.childElementCount > 0) {
		elVersionInitial.removeChild(elVersionInitial.options[0]);
	};
	while(elVersionFinal.childElementCount > 0) {
		elVersionFinal.removeChild(elVersionFinal.options[0]);
	};
	elVersionInitial.appendChild(fragmentVersionList.cloneNode(true));
	elVersionFinal.appendChild(fragmentVersionList);
	
	setCountRowTable(document.querySelector('.setting__element--count-row-table'), data.Data.length);
	setCaptionTableCountVersion(data.Data.length);
	
	createUpdatePaginationTable('.all-versions-application');
}

// КОНЕЦ: РЕЗУЛЬТАТ AJAX ЗАПРОСА
// ************************************************************************************* //



// ************************************************************************************* //
// НАЧАЛО: СОЗДАНИЕ DOM-ЭЛЕМЕНТОВ

function createElLink(href, textContent) {
	
	let el = document.createElement('a');
	el.classList.add('link');
	el.setAttribute('target', '_blank');
	el.setAttribute('href', href);
	el.textContent = textContent;
	
	return el;
}

function createElTextDate(stringDate) {
	
	let el,
		dateFeatures = toDetermineTheCharacteristicsOfTheDate(stringDate);
	
	if (dateFeatures.countDate > 10) {
		el = document.createTextNode(dateFeatures.dateString);
	} else {
		el = document.createElement('b');
		el.classList.add('text-important');
		el.textContent = dateFeatures.dateString;
	};
	
	return el;
}

function createElPreviousVersions(project, fromVersions) {
	
	let arr;
	
	if ( typeof fromVersions == 'string' ) {
		arr = fromVersions.split(';');
	} else {
		arr = fromVersions;
	};
	
	let elParrent = document.createElement('ul');
	elParrent.classList.add("list-version");
	elParrent.classList.add("clearfix");
	
	arr.forEach(function(version, index) {
		if (!version) {
        	return;
        };
      	version = version.trim();
		let elItem = document.createElement('li');
		elItem.classList.add("item-version");
		elItem.appendChild( createElLink(linkConfigurationVersion(project, version), version) );
		elParrent.appendChild(elItem);
	});
	
	return elParrent;
}

// КОНЕЦ: СОЗДАНИЕ DOM-ЭЛЕМЕНТОВ
// ************************************************************************************* //



// ************************************************************************************* //
// НАЧАЛО: ПАГИНАЦИЯ ТАБЛИЦЫ

function createUpdatePaginationTable(nameTable) {
	
	let elTbody = document.querySelector(nameTable),
		dataCount = +elTbody.getAttribute('data-count'),
		countRowTable = getCountRowTable(dataCount), // количество видимых строк
		countPagesTable = Math.ceil(dataCount * 1.0 / countRowTable), // количество страниц
		elPaginationTable = document.querySelector('[data-toggle="' + nameTable + '"]'), // блок навигации
		countLi = elPaginationTable.children.length; // количество кнопок-страниц
	
	// удаление пустых строк
	while(elTbody.rows.length > dataCount) {
		elTbody.deleteRow(dataCount);
	};
	
	// добавляем/удаляем навигационные кнопки
	if (countLi > countPagesTable) {
		while(elPaginationTable.children.length > countPagesTable) {
			elPaginationTable.removeChild(elPaginationTable.children[countPagesTable]);
		};
	} else if (countLi < countPagesTable) {
		let fragment = document.createDocumentFragment();
		for (let i = countLi + 1; i <= countPagesTable; i++) {
			let elItem = document.createElement('li'),
				elLink = document.createElement('a');
			elLink.classList.add('link');
			elLink.classList.add('pagination__link');
			elLink.textContent = i;
			elItem.classList.add('pagination__item');
			elItem.appendChild(elLink);
			fragment.appendChild(elItem);
		}
		elPaginationTable.appendChild(fragment);
	};
	
	// определяем активную навигационную кнопку
	if (elPaginationTable.children.length) {
		let elActive = elPaginationTable.querySelector('.active');
		if (elActive) {
			elActive.classList.remove('active');
		};
		elPaginationTable.children[0].classList.add('active');
	};
	
	// добавление пустых строк
	let deltaRow = (countRowTable * countPagesTable) - dataCount;
	if (deltaRow) {
		let fragment = document.createDocumentFragment(),
		    nameColumn = ['number-row', 'version-column', 'info-update', 'previous-versions', 'table__cell--size-file'];
		for (let i = 0; i < deltaRow; i++) {
			let elTr = document.createElement('tr');
			elTr.classList.add('table__row');
			for (let j = 0; j <= 4; j++) {
				let elTd = document.createElement('td');
				elTd.classList.add("table__cell");
				elTd.classList.add("table__cell--" + nameColumn[j]);
				elTr.appendChild(elTd);
			};
			fragment.appendChild(elTr);
		};
		elTbody.appendChild(fragment);
	};
	
	// скрываем строки
	for (let i = 0; i < countRowTable; i++) {
		elTbody.rows[i].classList.remove('hidden');
	};
	for (let i = countRowTable; i < (dataCount + deltaRow); i++) {
		elTbody.rows[i].classList.add('hidden');
	};
}

function makeTransitionPaginationTable(el) {
	
	if (el.parentElement.classList.contains('active')) 
		return;
	
	let elPaginationTable = el.parentElement.parentElement,
		nameTable = elPaginationTable.getAttribute('data-toggle'),
		elActive = elPaginationTable.querySelector('.active'),
		countRowTable = getCountRowTable(), // количество видимых строк
		elTbody = document.querySelector(nameTable),
		dataCount = elTbody.rows.length,
		previous, next;
	
	if (elActive) {
		elActive.classList.remove('active');
		previous = + elActive.textContent;
	};
	
	el.parentElement.classList.add('active');
	next = + el.textContent;
	
	for (let i = 0; i < countRowTable; i++) {
		if (previous && ((previous - 1) * countRowTable + i) < dataCount) {
			let indexRow = (previous - 1) * countRowTable + i;
			elTbody.rows[indexRow].classList.add('hidden');
		};
		if ( ((next - 1) * countRowTable + i) < dataCount) {
			let indexRow = (next - 1) * countRowTable + i;
			elTbody.rows[indexRow].classList.remove('hidden');
		};
	};
	
}

// КОНЕЦ: ПАГИНАЦИЯ ТАБЛИЦЫ
// ************************************************************************************* //


// ************************************************************************************* //
// НАЧАЛО: КАЛЬКУЛЯТОР РЕЛИЗОВ

function runCalculatorUpdates(target) {
	
	let runCalculatorUpdates = false;
	
	if (target.classList.contains('calculator-updates__checkbox')) {
		// меняем доступность элементов по переключателю "КАЛЬКУЛЯТОР ОБНОВЛЕНИЙ"
		
		let elLabelHeader = document.querySelector('.calculator-updates__label-header'),
			elGroupVersion = document.querySelector('.calculator-updates__group'),
			elGroupVersionLegend = document.querySelector('.calculator-updates__group-legend');
		
		toggleClass(elLabelHeader, 'switch__header--active'); // Меняем цвет заголовка переключателя
		toggleClass(elGroupVersion, 'calculator-updates__group--active'); // Меняем цвет группы с версиями конфигурации
		
		toggleAttribute(elGroupVersion, 'disabled', 'disabled'); // Меняем доступность группы с версиями конфигурации
		
		if (elGroupVersion.classList.contains('calculator-updates__group--active')) {
			runCalculatorUpdates = true;
		};
		
	} else if (target.classList.contains('calculator-updates__version-initial') || target.classList.contains('calculator-updates__version-final')) {
				
		runCalculatorUpdates = true;
			
	} else {
		return;
	};
	
	setCalculatorUpdatesDefault();
	
	let elTbody = document.querySelector('.all-versions-application');
	
	var elResultList = document.querySelector('.calculator-updates__result-list'),
		countResult = 0;
	
	if (runCalculatorUpdates) {
		let elVersionInitial = document.querySelector('.calculator-updates__version-initial'),
			elVersionFinal = document.querySelector('.calculator-updates__version-final');
		
		if (elVersionInitial.selectedIndex > elVersionFinal.selectedIndex) {
			//console.log(elVersionInitial.value + ' --> ' + elVersionFinal.value);
			let arr = getTableCalculatorUpdates({index: elVersionInitial.selectedIndex, value: elVersionInitial.value}, {index: elVersionFinal.selectedIndex, value: elVersionFinal.value}),
			    fromVersions = [];

            countResult = arr.length;
			
			arr.forEach(function(item, index) {
				if (index === 0) {
					elTbody.rows[item.indexVersion].classList.add('calculator-updates__row');
					elTbody.rows[item.indexVersion].cells[1].children[0].classList.add('calculator-updates__link');
				};
				elTbody.rows[item.indexTargetVersion].classList.add('calculator-updates__row');
				elTbody.rows[item.indexTargetVersion].cells[1].children[0].classList.add('calculator-updates__link');
				elTbody.rows[item.indexTargetVersion].cells[3].children[0].querySelector('[href$="' + item.version + '"]').classList.add('calculator-updates__link');
				fromVersions.push(item.versionTaget);
			});
			
			elResultList.appendChild( createElPreviousVersions(document.querySelector('.setting__select-configuration').value, fromVersions) );
			
		};
	
	};
	
	document.querySelector('.calculator-updates__result-count').textContent = countResult;
}

function setCalculatorUpdatesDefault() {
	
	document.querySelector('.calculator-updates__result-count').textContent = 0;
	let elResultList = document.querySelector('.calculator-updates__result-list');
	if (elResultList.children.length) {
		elResultList.removeChild(elResultList.children[0]);
	};
	
	let elTbody = document.querySelector('.all-versions-application');
	
	// Убираем раскраску со строк основной таблицы
	let rowsCalculatorUpdates = elTbody.querySelectorAll('.calculator-updates__row'); 
	for (let i = 0; i < rowsCalculatorUpdates.length; i++) {
		rowsCalculatorUpdates[i].classList.remove('calculator-updates__row');
	};
	// Убираем раскраску со ссылок таблицы
	let linkCalculatorUpdates = elTbody.querySelectorAll('.calculator-updates__link'); 
	for (let i = 0; i < linkCalculatorUpdates.length; i++) {
		linkCalculatorUpdates[i].classList.remove('calculator-updates__link');
	};
	
}

function getTableCalculatorUpdates(versionInitial, versionFinal) {
	
	let elTbody = document.querySelector('.all-versions-application');
	
	let arr = [],
		next = true,
		indexVersion = versionInitial.index;
	
	while (next) {
		next = false;
	
		let versionUpdate = elTbody.rows[indexVersion].cells[1].innerText;
		
		for (let indexTargetVersion = versionFinal.index; indexTargetVersion < indexVersion; indexTargetVersion++) {
			let previousVersions = elTbody.rows[indexTargetVersion].cells[3].innerText,
				targetVersions = elTbody.rows[indexTargetVersion].cells[1].innerText;
			if ( ~previousVersions.indexOf(versionUpdate) ) {
				
				arr.push( {indexVersion: indexVersion, version: versionUpdate, indexTargetVersion: indexTargetVersion, versionTaget: targetVersions} );
				
				indexVersion = indexTargetVersion;
				next = true
				break;
			};
		};
		
		if (!next) {
			break;
		} else if (indexVersion == versionFinal.index) {
			break;
		};
		
	};
	
	//console.log(arr);
	
	return arr;
		
}

// КОНЕЦ: КАЛЬКУЛЯТОР РЕЛИЗОВ
// ************************************************************************************* //



// ************************************************************************************* //
// НАЧАЛО: ССЫЛКИ

function linkConfiguration(project) {
	return 'https://releases.1c.ru/project/' + project;
}

function linkConfigurationVersion(project, version) {
	return 'https://releases.1c.ru/version_files?nick=' + project + '&ver=' + version;
}

function linkNews(name, edition) {
	return 'http://downloads.1c.ru/ipp/ITSREPV/V8Update/Configs/' + name + '/' + edition + '/83/news.htm'
}

function linkVersionNews(name, version) {
	return 'http://downloads.v8.1c.ru/content/' + name + '/' + version.replace(/\./g,'_') + '/news.htm'
}

// КОНЕЦ: ССЫЛКИ
// ************************************************************************************* //



// ************************************************************************************* //
// НАЧАЛО: ПРОЧИЕ ФУНКЦИИ

function runAnimateScroll(elLink) {
	let V = 1, // скорость
		delta = 70; // доп отступ сверху
	let w = window.pageYOffset,  // производим прокрутка прокрутка
		hash = elLink.href.replace(/[^#]*(.*)/, '$1');  // к id элемента, к которому нужно перейти
		t = document.querySelector(hash).getBoundingClientRect().top - delta,  // отступ от окна браузера до id
		start = null;
	
	window.location.hash = '';
	
	requestAnimationFrame(step);  // подробнее про функцию анимации [developer.mozilla.org]
	
	
	function step(time) {
		
		if (start === null) start = time;
		let progress = time - start,
			r = (t < 0 ? Math.max(w - progress/V, w + t) : Math.min(w + progress/V, w + t));
		window.scrollTo(0,r);
		if (r != w + t) {
			requestAnimationFrame(step);
		/*} else {
			location.hash = hash  // URL с хэшем*/
		}
	}
}

function getCountRowTable() {
	// количество видимых строк у таблицы
	return +document.querySelector('.setting__element--count-row-table').value;
}

function setCountRowTable(el, max) {
	if (max !== undefined) el.max = +max > +el.min ? ( +max - ((+max) % (+el.step)) + (+el.step) ) : el.min;
	if (+el.value > +el.max) el.value = el.max;
	if (+el.value < +el.min) el.value = el.min;
}

function setCaptionTableCountVersion(count) {
	document.querySelector('.setting__text--count-version').textContent = count;
}

function setAttributeSettingConfigurationLink(project, textContent) {
	let elLink = document.querySelector('.table__caption-link');
	elLink.setAttribute('href', linkConfiguration(project));
	elLink.textContent = textContent;
}

function convertationByteMbyte(textSize) {
	return Math.round(+textSize / (1024 * 1024));
}

function toDetermineTheCharacteristicsOfTheDate(stringDate) {
	
	let options = {
		year: '2-digit',
		month: 'numeric',
		day: 'numeric',
	};
	
	let msUTC = Date.parse(stringDate),
		dateString = new Date(msUTC).toLocaleString('ru', options),
		msUTCNow = Date.now();

	let countDate = Math.floor((msUTCNow - msUTC) / (1000 * 3600 * 24));
	
	return {
		dateString: dateString, 
		countDate: countDate
	};
}

function toggleClass(el, nameClass) {
	if (el.classList.contains(nameClass)) {
		el.classList.remove(nameClass);
	} else {
		el.classList.add(nameClass);
	};
}

function toggleAttribute(el, nameAttribute, valueAttribute) {
	if (!el.hasAttribute(nameAttribute)) {
		el.setAttribute(nameAttribute, valueAttribute);
	} else {
		el.removeAttribute(nameAttribute);
	};
}

function myRequest(url, callback, params = []) {
	
	const mainURL = '/api/';

	let xhr = new XMLHttpRequest();
	xhr.open('GET', mainURL + url, true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) {
			return;
		}
		
		let data;
		if (xhr.status == 200) {
			data = JSON.parse(xhr.responseText);
		}
		callback(data, params);
	};
}
