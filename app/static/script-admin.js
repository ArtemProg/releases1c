document.addEventListener("DOMContentLoaded", function () {

	[...document.querySelectorAll('.action-element')].map(el => el.addEventListener('click', eventClickAdminSettingActionElement));
//    document.querySelector('#admin-configuration-setting').addEventListener('click', eventClickAdminSettingActionElement);
//    document.forms.config.querySelector('.action-element').addEventListener('click', eventClickAdminSettingActionElement);
	[...document.querySelectorAll('.popup-btn-close')].map(el => el.addEventListener('click', eventClickPopupClose));
});



// ************************************************************************************* //
// НАЧАЛО: ОБРАБОТЧИКИ СОБЫТИЙ

function eventClickAdminSettingActionElement(event) {
	event.preventDefault();

	let target = event.target;

	if (target.tagName == 'BUTTON') {

        let controlsId = target.getAttribute('data-controls'),
            actionPerformed = target.getAttribute('data-action');

        if (['append', 'edit', 'delete'].indexOf(actionPerformed) != -1) {
            openSettingActionElement(target, controlsId, actionPerformed);
        } else if (actionPerformed == 'save') {
            saveFormSettingActionElement(target, controlsId, actionPerformed);
        }

	}
}

function eventClickPopupClose(event) {
    event.preventDefault();
    closeFormSettingActionElement();
}

// КОНЕЦ: ОБРАБОТЧИКИ СОБЫТИЙ
// ************************************************************************************* //


// ************************************************************************************* //
// НАЧАЛО: ---

function openFormSettingActionElement(a,b,c) {
    document.querySelector('.overlay').classList.add('overlay--active');
    document.body.classList.add('overflow-hidden');
}

function closeFormSettingActionElement() {
    fillHandlerFormSettingActionElement();
	document.querySelector('.overlay').classList.remove('overlay--active');
	document.body.classList.remove('overflow-hidden');
}

function openSettingActionElement(elBtnOpen, controlsId, actionPerformed) {

    if (['append', 'edit', 'delete'].indexOf(actionPerformed) < 0) {
        return;
	}

    openFormSettingActionElement(elBtnOpen, controlsId, actionPerformed);

    fillHandlerFormSettingActionElement(elBtnOpen, controlsId, actionPerformed);
}

function fillHandlerFormSettingActionElement(elBtnOpen, controlsId, actionPerformed) {

    let elTitle = document.querySelector('.popup-title'),
        elBtnSave = document.querySelector('[data-action="save"]'),
        elId = document.querySelector('#element-id'),
        elDescription = document.querySelector('#element-description'),
        elProject = document.querySelector('#element-project'),
        elName = document.querySelector('#element-name'),
        elEdition = document.querySelector('#element-edition'),
        elActive = document.querySelector('#element-active'),
        dataElement = {
            id: '',
            description: '',
            project: '',
            name: '',
            edition: '',
            active: false
        },
        rowIndex = -1;

    let textTitle = '',
        textBtnSave = '',
        titleBtnSave = '',
        textFormAction = '';

    if (actionPerformed == 'append') {
        textTitle = 'Добавление';
        textBtnSave = 'Сохранить запись';
        titleBtnSave = 'Сохранить конфигурацию';
    } else if (actionPerformed == 'edit') {
        textTitle = 'Редактирование';
        textBtnSave = 'Сохранить изменения';
        titleBtnSave = 'Сохранить изменения конфигурации';
    } else if (actionPerformed == 'delete') {
        textTitle = 'Удаление';
        textBtnSave = 'Удалить запись';
        titleBtnSave = 'Удалить конфигурацию';
    }

    if (['append', 'edit', 'delete'].indexOf(actionPerformed) != -1) {
        textFormAction = actionPerformed;
	}

    elTitle.innerText = textTitle;
    elBtnSave.innerText = textBtnSave;
    elBtnSave.setAttribute('title', titleBtnSave);

    if (actionPerformed == 'edit' || actionPerformed == 'delete') {
        let elTr = elBtnOpen.parentElement;
        while (elTr.tagName != 'TR') {
            elTr = elTr.parentElement;
        }
        rowIndex = elTr.rowIndex;
        dataElement.id = elTr.querySelector('[data-parameter="id"]').innerText;
        dataElement.description = elTr.querySelector('[data-parameter="description"]').innerText;
        dataElement.project = elTr.querySelector('[data-parameter="project"]').innerText;
        dataElement.name = elTr.querySelector('[data-parameter="name"]').innerText;
        dataElement.edition = elTr.querySelector('[data-parameter="edition"]').innerText;
        dataElement.active = (elTr.querySelector('[data-parameter="active"]').getAttribute('data-value').toUpperCase() == 'TRUE');
    }

    if (actionPerformed == 'delete') {
        elDescription.setAttribute('disabled', 'disabled');
        elProject.setAttribute('disabled', 'disabled');
        elName.setAttribute('disabled', 'disabled');
        elEdition.setAttribute('disabled', 'disabled');
        elActive.setAttribute('disabled', 'disabled');
    } else if (actionPerformed == 'append' || actionPerformed == 'edit') {
        elDescription.removeAttribute('disabled');
        elProject.removeAttribute('disabled');
        elName.removeAttribute('disabled');
        elEdition.removeAttribute('disabled');
        elActive.removeAttribute('disabled');
    }

    elId.value = dataElement.id;
    elDescription.value = dataElement.description;
    elProject.value = dataElement.project;
    elName.value = dataElement.name;
    elEdition.value = dataElement.edition;
    elActive.checked = dataElement.active;
//    if (dataElement.active) {
//        elActive.setAttribute('checked', 'checked');
//    } else {
//        elActive.removeAttribute('checked');
//    }

    document.forms.config.setAttribute('actionPerformed', textFormAction);
    document.forms.config.querySelector('#rowIndex').value = rowIndex;
}

function saveFormSettingActionElement(elBtnOpen, controlsId, actionPerformed) {

    let params =
        {
            configuration: {
                id: document.querySelector('#element-id').value,
                description: document.querySelector('#element-description').value,
                project: document.querySelector('#element-project').value,
                name: document.querySelector('#element-name').value,
                edition: document.querySelector('#element-edition').value,
                active: document.querySelector('#element-active').checked
            },
            action: document.forms.config.getAttribute('actionPerformed'),
            rowIndex: document.forms.config.querySelector('#rowIndex').value
        },
        json = JSON.stringify(params);
    myRequestPOST('save', saveProcessingResultsAjax, params, json);
    //closeFormSettingActionElement();
}

function saveProcessingResultsAjax(data, params) {

	if (!data) { return; }

	if (data.Error) {
		/* офрмить вывод сообщения об ошибке */
		//document.querySelector('.error').classList.remove('hidden');
		console.log(data.TextError);
		return;
	}

	closeFormSettingActionElement();

    var actionPerformed = params.action,
        elTbody = document.querySelector('#admin-configuration-setting'),
        fragmentTbody = document.createDocumentFragment();

    if (actionPerformed == 'delete') {
        let targetIndex = (+params.rowIndex) - 1;
        elTbody.deleteRow(targetIndex);
        for (let i = targetIndex; i < elTbody.rows.length; i++) {
		    elTbody.rows[i].cells[0].innerText = i + 1;
	    };
    } else if (actionPerformed == 'append') {
        let elTr = document.createElement('tr');
        elTr.classList.add('table__row');

        let elTd;
        // №
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elTd.classList.add('table__cell--number-row');
        elTd.setAttribute('data-id', params.configuration.id);
        elTd.innerText = elTbody.rows.length + 1;
        elTr.appendChild(elTd);

        // description
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elTd.setAttribute('data-parameter', 'description');
        elTd.innerText = params.configuration.description;
        elTr.appendChild(elTd);

        // project
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elTd.setAttribute('data-parameter', 'project');
        elTd.innerText = params.configuration.project;
        elTr.appendChild(elTd);

        // name
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elTd.setAttribute('data-parameter', 'name');
        elTd.innerText = params.configuration.name;
        elTr.appendChild(elTd);

        // edition
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elTd.setAttribute('data-parameter', 'edition');
        elTd.innerText = params.configuration.edition;
        elTr.appendChild(elTd);

        // id
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elTd.setAttribute('data-parameter', 'id');
        elTd.innerText = data.Data;
        elTr.appendChild(elTd);

        // active
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elTd.setAttribute('data-parameter', 'active');
        elTd.setAttribute('data-value', params.configuration.active);
        if (params.configuration.active) {
            elTd.innerText = String.fromCharCode(10004);
        } else {
            elTd.innerText = '';
        }
        elTr.appendChild(elTd);

        let elBtn;

        // edit
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elBtn = document.createElement('button');
        elBtn.classList.add('setting__element');
        elBtn.classList.add('action-element');
        elBtn.classList.add('btn');
        elBtn.setAttribute('data-action', 'edit');
        elBtn.setAttribute('data-controls', 'admin-configuration-setting');
        elBtn.setAttribute('title', 'Редактировать конфигурацию');
        elBtn.textContent = String.fromCharCode(9998);
        elBtn.addEventListener('click', eventClickAdminSettingActionElement)
        elTd.appendChild(elBtn);
        elTr.appendChild(elTd);

        // delete
        elTd = document.createElement('td');
        elTd.classList.add('table__cell');
        elBtn = document.createElement('button');
        elBtn.classList.add('setting__element');
        elBtn.classList.add('action-element');
        elBtn.classList.add('btn');
        elBtn.setAttribute('data-action', 'delete');
        elBtn.setAttribute('data-controls', 'admin-configuration-setting');
        elBtn.setAttribute('title', 'Удалить конфигурацию');
        elBtn.textContent = String.fromCharCode(10006);
        elBtn.addEventListener('click', eventClickAdminSettingActionElement)
        elTd.appendChild(elBtn);
        elTr.appendChild(elTd);

        fragmentTbody.appendChild(elTr);
        elTbody.appendChild(fragmentTbody);

    } else if (actionPerformed == 'edit') {
        let elTr = elTbody.rows[(+params.rowIndex) - 1];
        elTr.querySelector('[data-parameter="description"]').innerText = params.configuration.description;
        elTr.querySelector('[data-parameter="project"]').innerText = params.configuration.project;
        elTr.querySelector('[data-parameter="name"]').innerText = params.configuration.name;
        elTr.querySelector('[data-parameter="edition"]').innerText = params.configuration.edition;

        let elTd = elTr.querySelector('[data-parameter="active"]');
        elTd.setAttribute('data-value', params.configuration.active);
        if (params.configuration.active) {
            elTd.innerText = String.fromCharCode(10004);
        } else {
            elTd.innerText = '';
        }
    }
}
// КОНЕЦ: ---
// ************************************************************************************* //


// ************************************************************************************* //
// НАЧАЛО: ПРОЧИЕ ФУНКЦИИ

function myRequestPOST(url, callback, params = [], json) {

	const mainURL = '/api/';

	let xhr = new XMLHttpRequest();
	xhr.open('POST', mainURL + url, true);
	xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
	xhr.send(json);

	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) {
			return;
		}

		let data;
		if (xhr.status == 200) {
			data = JSON.parse(xhr.responseText);
		}

		setTimeout(function(){
		    callback(data, params);
		}, 0);

	};
}
