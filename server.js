const WebSocket = require('ws');
var port = process.env.PORT || 3000;
const server  = new WebSocket.Server({port: port});
var choosen = [];
server.on('connection', ws => {
  server.clients.forEach(client => {
    if(client.readyState === WebSocket.OPEN){
        client.send(JSON.stringify({choosen:choosen}));
    }
  });
    ws.on('message', data => {
        
        data = JSON.parse(data);
        choosen.push(data.choosenTask);
        data.choosen = choosen;
        server.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(data));
            }
        });
        
        let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        storeInMySQL(data.username, date, data.choosenTask.replace(/\D/g,''));
    })
    ws.send('Сервер арбайтен');
});

// заненсение сообщений в БД
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
      password: 'P3cJk33A0q'
  });

  const sql = `INSERT INTO messages(user,date,message) VALUES('${user}','${date}','${mess}')`;
  
  connection.query(sql, function(err, results) {
      if(err) console.log(err);
      console.log(results);


      clients[id] = ws



  });
  
  connection.end();
}

/*
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