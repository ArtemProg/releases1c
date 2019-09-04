document.addEventListener("DOMContentLoaded", function () {
    [...document.querySelectorAll('.action-element')].map(el => el.addEventListener('click', eventClickAdminSettingActionElement));
});



// ************************************************************************************* //
// НАЧАЛО: ОБРАБОТЧИКИ СОБЫТИЙ

function eventClickAdminSettingActionElement(event) {
	event.preventDefault();

	let target = event.target;

	if (target.tagName == 'BUTTON') {

        let controlsId = target.getAttribute('data-controls'),
            actionPerformed = target.getAttribute('data-action');

        if (actionPerformed == 'save') {
            saveFormSettingActionElement(target, controlsId, actionPerformed);
        }

	}
}

// КОНЕЦ: ОБРАБОТЧИКИ СОБЫТИЙ
// ************************************************************************************* //


// ************************************************************************************* //
// НАЧАЛО: ---

function saveFormSettingActionElement(elBtnOpen, controlsId, actionPerformed) {
    let arr = [],
        arrCheckboxConfigurations = document.querySelectorAll('#profile-configuration-setting [type=checkbox]:checked');
	for (let i = 0; i < arrCheckboxConfigurations.length; i++) {
		arr.push(arrCheckboxConfigurations[i].getAttribute('data-id'));
	};

    let params =
        {
            configuration: {
                id: arr
            },
            action: 'profile-save'
        },
        json = JSON.stringify(params);
    myRequestPOST('save', saveProcessingResultsAjax, params, json);
    //closeFormSettingActionElement();
}

function saveProcessingResultsAjax(data, params) {

	if (!data) { return; }

	if (data.Error) {
		console.log(data.TextError);
		return;
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
