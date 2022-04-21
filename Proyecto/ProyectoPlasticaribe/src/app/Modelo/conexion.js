
var Connection = require('tedious').Connection;
    var config = {
        server: '192.168.0.250',
        authentication: {
            type: 'default',
            options: {
                userName: 'sa',
                password: '123581321'
            }
        },
        options: {
            encrypt: true,
            database: 'PlasticaribeBD'
        }
    };
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if(connection!= err){
            console.log("Connected");
        }else{
            console.log("sin conexion");
        }
    });

    connection.connect();

//Conexión con la base de datos.
const rest = new (require('rest-mssql-nodejs'))({
    user: 'sa',
    password: '123581321',
    server: '192.168.0.250',
    database: 'PlasticaribeBD',
    "options": {
      "encrypt": true,
      "enableArithAbort": true
    }
 });

 module.exports = {rest}

