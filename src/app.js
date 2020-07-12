'use strict'

//VARIABLE GLOBALES 
const express = require("express")
const app = express();
const bodyParser = require("body-parser")


//CARGA DE RUTAS
var Tw_Routes = require("./routes/Tw_Routes")


//MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//CABECERAS
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')

    next();
})

app.use('/api', Tw_Routes)



//EXPORTAR
module.exports = app;