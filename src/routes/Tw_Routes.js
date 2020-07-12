'use strict'

var express = require("express")
var Tw_Controller = require("../controllers/Tw_Controller")
var md_auth = require("../middlewares/authenticated")

//RUTAS
var api = express.Router()


api.post('/commands', md_auth.ensureAuth, Tw_Controller.commands);
module.exports = api;


