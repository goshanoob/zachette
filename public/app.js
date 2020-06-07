const messages = document.getElementById('messages');
var FIO = '';

const HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);

ws.onopen = () => setStatus('Клиент: Подключен, ');
ws.onclose =() => setStatus('Клиент: Отключился, ');
ws.onmessage = response => requestEvent(JSON.parse(response.data));

/* Логика срабатывания на сообщения сервера */
function requestEvent(value){
    switch(value.messType){
        case 'time': document.getElementById('time').innerHTML = `Время сервера: ${value.message}`; break;
        case 'status': document.getElementById('statusServ').innerHTML = value.message; break;
        case 'findUser': showUsers(value.message); break;
        case 'identification': makeIdentification(value); break;
        case 'message': addMessage(value.message); break;
        case 'choose': setChoose(value); break;
    }
}

/* Функция для вывода сообщений о клиенте*/
function setStatus(value, param){
    document.getElementById('status').innerHTML = value;
}

/* Поиск пользователя при вводе */ 
document.getElementById('userName').addEventListener('input', e => {
    const str = e.target.value;
    if(str.length > 0){
        ws.send(JSON.stringify({messType: 'findUser', username: str}));
    }
});

/* Функция показа найденных пользователей */
function showUsers(users){
    const res = document.getElementById('searchResults');
    res.innerHTML = "";
    res.style.display = "block";
    users.forEach(name => {
        const div = document.createElement('div'); 
        div.innerHTML = name; 
        div.className = 'res';
        res.appendChild(div);
        div.addEventListener('click', e => {
            document.getElementById('userName').value = e.target.innerHTML;
            e.target.parentNode.style.display = 'none';
        });
    });
}
// скрыть найденных пользователей при щелчке в любом месте документа
document.addEventListener('click', () => {
    document.getElementById('searchResults').style.display = 'none'
});

/* Подтверждение выбора пользователя */
document.getElementById('sendName').addEventListener('click', () => {
    ws.send(JSON.stringify({messType: 'identification', username: document.getElementById('userName').value}));
});

/* Сервер обработал запрос на идентификацию и прислал ответ */
function makeIdentification(value){
    document.getElementById('statusIdent').innerHTML = value.message;
    // если сервер прислал имя пользователя, то пользователь найден
    if(value.hasOwnProperty("username")){
        // делаем билеты доступными для выбора
        makeTask(); 
        FIO = value.username;
    }
    if(value.hasOwnProperty("zadacha")){
        // показываем задачу
         document.getElementById("zadacha_"+value.zadacha).style.display = "block";
    }
}

/* Вывод сообщений от сервера */
function addMessage(value){
    const div = document.createElement('div');
    div.innerHTML = value;
    messages.appendChild(div);
}

/* Регистрация слушателей на каждый билет */
function makeTask(){
    for(let i=0, tasks = document.getElementsByClassName('tasks'), len = tasks.length; i < len; i++){
        tasks[i].addEventListener('click', makeChoose);
    }
}

/* Отправка номера билета и удаление слушателей */
function makeChoose(){
    if(FIO === '' || FIO === 'undefined'){
        alert('Вы не прошли идентификацию');
        return;
    }
    ws.send(JSON.stringify({messType: 'choose', username: FIO, choosenTask: this.id}));
    for(let i=0, tasks = document.getElementsByClassName('tasks'), len = tasks.length; i < len; i++){
        tasks[i].removeEventListener('click', makeChoose);
    }
}

function setChoose(value){
    /* Пометить выбранные билеты стилями */
    for(let i=0, len = value.choosenTask.length; i < len; i++){
        document.getElementById(value.choosenTask[i]).className = 'tasks choosen';
    }
    
    /* Если появились новые выбранные билеты, то информируем сообщением от сервера  */
    if(value.hasOwnProperty("task")){
        addMessage(`Пользователь ${value.username} дропнул билет № ${value.task.replace(/\D/g,"")}. Удачи`);
    }
}