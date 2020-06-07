const express = require('express');

var port = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express().
use(express.static(__dirname + '/public'))
.use((req, res) => res.sendFile(INDEX, { root: __dirname }))
.listen(port, () => console.log(`Listening on ${port}`));

const { Server } = require('ws');
const wss = new Server({ server });

// выбранные билеты
var choosen = [];
// номера задач
const nums = [10, 8, 7, 1, 12, 4, 5, 2, 13, 9, 6, 3, 11, 14, 14];
// перечень пользователей
var users = {
  'Бояршинова Александра Сергеевна': 0,
  'Габбасов Радмир Рамилевич': 0,
  'Гоффоров Нурбекжон Обиджон угли': 0,
  'Гребенщиков Александр Александрович': 0,
  'Деньгина Анастасия Андреевна': 0,
  'Закирова Юлиана Раилевна': 0,
  'Кугушев Даниил Ильич': 0,
  'Мухаметов Рустам Данилович': 0,
  'Николаев Николай Андреевич': 0,
  'Потураев Глеб Сергеевич': 0,
  'Пушняков Василий Сергеевич': 0,
  'Рахматуллин Серафим Маратович': 0,
  'Хомяков Илья Андреевич': 0,
  'Шашуро Максим Владимирович': 0,
  'Шердакова Екатерина Сергеевна': 0,
  'Ярушин Михаил Валерьевич': 0,
  'username': 0
}

wss.on('connection', ws => {
  /* Клиенту уходит массив выбранных билетов */
  wss.clients.forEach(client => {
        client.send(JSON.stringify({messType:'choose', choosenTask:choosen}));
  });

  /* На сервер пришло сообщение ... */
  ws.on('message', data => {
        data = JSON.parse(data);
        /* Определяем тип сообщения */
        switch(data.messType){
          case 'findUser': findUser2(); break;
          case 'identification': getId(); break;
          case 'choose': getChoose(); break;
        }

        // Поиск пользователя в БД - только десять подключений в heroku, лучше сохраню в массиве, всего 17 стедунтов
        function findUser(){
          let connect = connectMySQL();
          const sql = "SELECT * FROM users WHERE name LIKE ? ORDER BY name";
          connect.query(sql, data.username+'%', (err, results) => {
            if(err) console.log(err);
            console.log(results);
          });
          connect.end();
        }

        /* Поиск пользователя по списку */
        function findUser2(){
          let reg = new RegExp('^'+data.username, 'i'), resp =[];
          /*for(let key in users){
            if(key.match(reg)){
              resp.push(key);
            }
          }
          console.log(resp);*/
          let result = Object.keys(users).filter(user => user.match(reg));
          console.log(result);
          ws.send(JSON.stringify({messType:'findUser', message:result}));
        }

        function getId(){
          if(users.hasOwnProperty(data.username)){
            let username = data.username;
            // Прислать номер билета, если уже выбран, либо оповестить о входе
            if(users[username] !== 0){
              ws.send(JSON.stringify({messType:'identification', message:`Вы уже выбрали билет №${users[username]}`}));
            } else {
              ws.send(JSON.stringify({messType:'identification', message:'Вы вошли - уже на троечку (шутка)', 
                username: username})
              );
              wss.clients.forEach(client => {
                client.send(JSON.stringify({messType: 'message', message:`${username} вошел (-а). Ура!`}));
              });
            }
            
          } else {
            ws.send(JSON.stringify({messType:'identification', message:'Пользователь не найден. Проверьте имя!'}));
          }
        }

        /* Обработка выбора пользователя */
        function getChoose(){
          /*
            Просмотреть выбранные билеты, убедиться, что билет не был выбран
            кем-то ранее, и прислать подтверждение клиенту, либо сообщить о неудаче
          */
          let username = data.username;
          let task = data.choosenTask;
          let num = nums[parseInt(task.replace(/\D/g,''))];
          let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
          let wasChoose = false; // для контроля повторного билета
          choosen.forEach(c => {
            if(c === task){
              return wasChoose = true;
            }
          });
          if(wasChoose){
            ws.send(JSON.stringify({messType:'identification', 
              message:'К сожалению, этот билет уже кто-то выбрал. Сделайте другой выбор...',
              username: username})
            );
            return;
          }
          console.log(username, users[username]);
          if(users.hasOwnProperty(username) && users[username] === 0){
            users[username] = task;
            choosen.push(task);
            ws.send(JSON.stringify({messType:'identification', message:`Вы дропнули задачу №${num}`, zadacha:num}));
            wss.clients.forEach(client => {
              client.send(JSON.stringify({messType:'choose', username: username, choosenTask:choosen, task: task}));
            });
            //storeInMySQL(username, date, task.replace(/\D/g,''));
            console.log(`${username} выбрал ${task} в ${date}`);
          } else {
            ws.send(JSON.stringify({messType:'identification', message:"Странно..."}));
          }
        }
    });

    ws.send(JSON.stringify({messType: 'status', message: 'Сервер арбайтен'}));
    
    setInterval( () => {
      ws.send(JSON.stringify({messType: 'time', message: new Date().toISOString().slice(0, 19).replace('T', ' ')}));
    }, 10000);
});


// подключение в БД
function connectMySQL(){
  return require("mysql2").createConnection({
      host: 'localhost',
      user: 'goshanoob',
      database: 'chat',
      password: 'P3cJk33A0q'
  });
}

// заненсение сообщений в БД
/*
function storeInMySQL(user,date,mess){
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
      host: 'localhost',
      user: 'goshanoob',
      database: 'chat',
      password: 'P3cJk33A0q'
  });

  const sql = `INSERT INTO messages(user,date,message) VALUES('${user}','${date}','${mess}')`;
  
  connection.query(sql, function(err, results) {
      if(err) console.log(err);
      console.log(results);
  });
  
  connection.end();
}

// поиск данных в БД

function searchInMySQL(task){
  const mysql = require("mysql2");
  const connection = mysql.createConnection({
      host: 'localhost',
      user: 'goshanoob',
      database: 'tasks',
      password: ''
  });

  const sql = `INSERT INTO messages(user,date,message) VALUES('${user}','${date}','${mess}')`;
  
  connection.query(sql, function(err, results) {
      if(err) console.log(err);
      console.log(results);


      clients[id] = ws



  });
  
  connection.end();
}


connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });

 connection.end(function(err) {
    if (err) {
      return console.log("Ошибка: " + err.message);
    }
    console.log("Подключение закрыто");
  });*/