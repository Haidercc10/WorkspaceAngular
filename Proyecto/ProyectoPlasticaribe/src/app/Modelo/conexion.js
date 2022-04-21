var Connection = require('tedious').Connection;  
    var config = {  
        server: '192.168.0.250.prueba',  //update me
        authentication: {
            type: 'default',
            options: {
                userName: '', //update me
                password: ''  //update me
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: true,
            database: 'prueba'  //update me
        }
    };  
    var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
        if(connection!= err){
            console.log("Connected"); 
        }else{
            console.log("sin conexion");
        }

         
    });
    
    connection.connect();

// var Connection = require('../lib/tedious').Connection;
// var Request = require('../lib/tedious').Request;

// var config = {
//   server: '192.168.0.250.prueba',
//   authentication: {
//     type: 'default',
//     options: {
//       userName: 'sa',
//       password: '123581321'
//     }
//   },
//   options: {
//     port: 4200 // Default Port
//   }
// };

// const connection = new Connection(config);

// connection.connect((err) => {
//   if (err) {
//     console.log('Connection Failed');
//     throw err;
//   }else{
//       console.log("conexion exitosa");
//   }

//   executeStatement();
// });

    // var Request = require('tedious').Request;  
    // var TYPES = require('tedious').TYPES;  
  
    // function executeStatement() {  
    //     request = new Request("SELECT u.id, u.nombre, u.contrasena FROM usuario AS u;", function(err) {  
    //     if (err) {  
    //         console.log(err);}  
    //     });  
    //     var result = "";  
    //     request.on('row', function(columns) {  
    //         columns.forEach(function(column) {  
    //           if (column.value === null) {  
    //             console.log('NULL');  
    //           } else {  
    //             result+= column.value + " ";  
    //           }  
    //         });  
    //         console.log(result);  
    //         result ="";  
    //     });  
  
    //     request.on('done', function(rowCount, more) {  
    //     console.log(rowCount + ' rows returned');  
    //     });  
        
    //     // Close the connection after the final event emitted by the request, after the callback passes
    //     request.on("requestCompleted", function (rowCount, more) {
    //         connection.close();
    //     });
    //     connection.execSql(request);  
    // }