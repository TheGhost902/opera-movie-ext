//---------------------------------------------------------------------------------------
//                           работа с хранилищем
//---------------------------------------------------------------------------------------
var data = {
    films: []
};

//получаем фильмы из хранилища, если нет свойства films, или фильмов нет, то устанавливается
//пустой массив в свойство films
chrome.storage.local.get(['films'], (result) => {
    if (result.films === undefined || result.films.length === 0) {
        console.log('no films in storage!');

       //при старте файла, обнуление списка всех фильмов в хранилище
        chrome.storage.local.set(data, () => {
        console.log('films array set to empty');
        }); 
    } else {
        console.log('films in storage: ', result.films);
    }
});

//слушаем изменения в хранилище
chrome.storage.onChanged.addListener((changes) => {
    chrome.storage.local.get(['films'], (result) => {
        console.log('обновлён список фильмов: ', result.films);
    });
});
//----------------------------------------------------------------------------------------
//                                  рисуем в бадже(уведомления)
//----------------------------------------------------------------------------------------
//сбрасываем текст баджа
chrome.browserAction.setBadgeText({text: ''});

//получаем инфу об активированной вкладке
chrome.tabs.onActivated.addListener((activateInfo) => {
    console.log('Активирована вкладка: ', activateInfo);

    //получаем активированную вкладку
    chrome.tabs.query({active: true, windowId: activateInfo.windowId}, (arrayOfTabs) => {
        const tab = arrayOfTabs[0];

        //проверяем не пустой ли url, или не системный ли он
        if (tab.url == false || tab.url.indexOf('chrome://') === 0) {
            console.log('нет url или начинается с chrome://...');
            chrome.browserAction.setBadgeText({text: ''});
        } else {
            console.log('url: ', tab.url);

            //если url подходит, получаем список всех фильмов в хранилище,
            //пробегаемся по нему, если есть совпадения то выводим в бадж
            //колличество серий либо время, если совпадений нет то удаляем бадж
            chrome.storage.local.get(['films'], (result) => {
                const { films } = result;

                let isBadgeSet = false;

                for (let i = 0; i < films.length; i++) {
                    if (films[i].url === tab.url) {
                        const film = films[i];

                        chrome.browserAction.setBadgeBackgroundColor({color: '#ff0000'});

                        if (film.episode === '0') {
                            chrome.browserAction.setBadgeText({text: film.time}); 
                        } else {
                            chrome.browserAction.setBadgeText({text: film.episode}); 
                        }
                        isBadgeSet = true;
                    }
                }

                if (!isBadgeSet) {
                    chrome.browserAction.setBadgeText({text: ''});
                }
            });
        }
    });
});
//---------------------------------------------------------------------------------------------