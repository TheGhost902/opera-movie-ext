//получение формы
const form = document.getElementById('mainForm');

//выделение текста при клике на поле ввода
for (let i = 0; i <= 3; i++) {
    form[i].onclick = function() {
        this.select();
    }
}

//получение элементов управления попапами
const addPopup = document.getElementById('add');
const updatedPopup = document.getElementById('updated');
const addBtn = document.getElementById('addButton');
const updBtn = document.getElementById('updatedButton');

//скрытие попапов
addBtn.addEventListener('click', () => {
    addPopup.style.display = 'none';
    window.close();
});
updBtn.addEventListener('click', () => {
    updatedPopup.style.display = 'none';
    window.close();
});

//показ попапов
function showAddPopup() {
    addPopup.style.display = 'flex';
    addBtn.focus();
};
function showUpdatedPopup() {
    updatedPopup.style.display = 'flex';
    updBtn.focus();
}

form.addEventListener('submit', (e) => {
    //отмена стандартого поведения формы
    e.preventDefault();

    //получение необходимых данных из полей ввода в форме
    const name = form[0].value;
    const season = form[1].value;
    const episode = form[2].value;
    const time = form[3].value;

    //получение активной вкладки и её url
    chrome.tabs.query({active: true}, (arrayOfTabs) => {
        //получение url
        const { url } = arrayOfTabs[0];

        //отменять функционал на систкмных страницах
        if (url.indexOf('chrome://') === 0) {
            return; //-------------------------------------------------------------------что нибудь придумать
        }
    
        //организация всех полученных данных в объект
        const data = {
            name,
            season,
            episode,
            time,
            url
        }
    
        //получение из хранилища списка всех фильмов, добовление нового или обновление,
        //и сохранение списка обратно в хранилище
        chrome.storage.local.get(['films'], (result) => {
            //массив всех фильмов
            const { films } = result;

            //переменная, которая позволит узнать смотрели ли фильм раньше
            let isFilmInfoWasUpdated = false;

            //пробегаемся по массиву фильмов и если уже заполняли информацию
            //об этом фильме, обновляем его информацию
            for (let i = 0; i < films.length; i++) {
                if (films[i].url === url) {
                    films[i] = data;

                    isFilmInfoWasUpdated = true;
                }
            }

            //если фильм был обновлён, то сохраняем обновлённый массив фильмов,
            //а если нет, то добовляем новый фильм в массив и потом сохраняем
            if (isFilmInfoWasUpdated) {
                chrome.storage.local.set({films: films}, () => {
                    showUpdatedPopup();
                });
            } else {
                films.push(data);
                chrome.storage.local.set({films: films}, () => {
                    showAddPopup();
                });
            }

            //обновление баджа
            chrome.browserAction.setBadgeBackgroundColor({color: '#ff0000'});
            if (data.episode === '0') {
                chrome.browserAction.setBadgeText({text: data.time}); 
            } else {
                chrome.browserAction.setBadgeText({text: data.episode}); 
            }
        });
    });
});

//функция берёт url текущей страницы, находит в хранилище фильм с таким же url
//и возвращает информацию о нём в промисе, если фильма нет то в промисе false
function getCurrentFilmInfo() {
    return new Promise((resolve) => {
        chrome.tabs.query({active: true}, (tabs) => {
            const { url } = tabs[0];
    
            chrome.storage.local.get(['films'], (result) => {
                const {films} = result;
    
                for (let i = 0; i < films.length; i++) {
                    if (films[i].url === url) {
                        resolve(films[i]);
                    }
                }
    
                resolve(false);
            });
        });            
    });
}

//если есть фильм в хранилище, то делаем автозаполнение полей
getCurrentFilmInfo().then((filmInfo) => {
    if (typeof filmInfo === 'object') {
        form[0].value = filmInfo.name;
        form[1].value = filmInfo.season;
        form[2].value = filmInfo.episode;
        form[3].value = filmInfo.time;
    }
});