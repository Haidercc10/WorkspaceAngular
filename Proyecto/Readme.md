# (Nombre App)

Aplicación web  desarrollada en Angular 15.2.7.

Este programa está diseñado para llevar unas existencias mas ordenadas, mostrar reportes de facturación de vendedores, realizar movimentos de materias primas, etc...

Se realiza un conexión a las siguientes APIS:
- API Plasticaribe [Plasticaribe](https://github.com/Haidercc10/PlasticaribeWebAPI).
+ API BagPro [BagPro](https://github.com/Haidercc10/BagPro_WebAPI).
* API Zeus Inventario [Zeus Inventario](https://github.com/Haidercc10/ApiZeusInventario).
- API zeus Contabilidad [Zeus Contabilidad](https://github.com/Haidercc10/ZeusContabilidadAPI).

Estas APis son utilizadas para realizar diferentes consultas, en principio despues de iniciar sesión se cargará un dashboard para el cual son necesarias todas estas APIs.

## Almacenamiento del Navegador
Al inciar sesión cada una de las APIs devolverá un token (diferente para cada una) que se guarda en el almcanemiento del navegador para ser utilizado en cada una de las consultas.

En el almacenamiento del navegador se guarda información como nombre de usuario, id del usuario, rol y los tokens. esta información se encuentra encriptada con la libreria [CriptoJs](https://www.npmjs.com/package/crypto-js), cada vez que se recarga la pagina se lee y se desencripta la información para guardarla en variables internas que se utilizan en diferentes casos.

Tambien se guarda una cookie que se utiliza para saber el tamaño de letra escogido por cada usuario para su pantalla.

