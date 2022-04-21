<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> 3105bda35c236ac1c782e16715c4dee5dea1b8f0
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

<<<<<<< HEAD
 module.exports = {rest}
>>>>>>> 239d2cf5c50c7a2bea9f29dd6b8d00abd7f5e1f7
=======
 module.exports = {rest}
>>>>>>> 3105bda35c236ac1c782e16715c4dee5dea1b8f0
