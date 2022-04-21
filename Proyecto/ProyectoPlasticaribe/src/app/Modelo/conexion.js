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

