const status = document.getElementById('status');
const messages = document.getElementById('messages');
const input = document.getElementById('input');

var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);
//const ws = new WebSocket('ws://localhost:2999');
for(let i=0, tasks = document.getElementsByClassName('tasks'), len = tasks.length; i < len; i++){
    tasks[i].addEventListener('click', choose);
}
function choose(){
    ws.send(JSON.stringify({username: 'goshanoob', choosenTask: this.id}));
    
    for(let i=0, tasks = document.getElementsByClassName('tasks'), len = tasks.length; i < len; i++){
        tasks[i].removeEventListener('click', choose);
    }
}

function setStatus(value){
    status.innerHTML = value;
}

function printMessage(value){
    for(let i=0; i<value.choosen.length; i++){
        document.getElementById(value.choosen[i]).className = 'tasks choosen';
    }
    
    if(value.hasOwnProperty("username")){
        const div = document.createElement('div');
        div.innerHTML = `Пользователь ${value.username} дропнул билет № ${value.choosenTask.replace(/\D/g,"")}. Удачи`;
        messages.appendChild(div);
    }
    
}


/*
document.getElementById("input").addEventListener('keydown', event =>{
    if(event.keyCode === 13){
        ws.send(JSON.stringify({username: 'goshan_loh',message: input.value}));
        input.value = "";
    }
});*/


ws.onopen = () => setStatus('Подключился');
ws.onclose =() => setStatus('Отключился');
ws.onmessage = response => printMessage(JSON.parse(response.data));
