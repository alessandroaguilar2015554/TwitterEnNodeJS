'use strict'



var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_TwitterDB';

exports.ensureAuth = function (req, res, next){
    var params = req.body;
    var UserInf = Object.values(params);
    var comando = UserInf.toString().split(" ");

    if (!req.headers.authorization) {
        if (comando[0] === 'REGISTER') {
            next();
        } else if (comando[0] === 'LOGIN') {
            next();
        } else {
            return res.status(404).send({ message: 'Error al iniciar sesión'});
        }
    } else {
        var token = req.headers.authorization.replace(/["']+/g, '');
        try {
            var payload = jwt.decode(token, secret);
            console.log(payload);
            var idUser = payload.sub;
            module.exports.idUser = idUser;
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'El token ha expirado.' });
            }
        } catch (ex) {
            return res.status(404).send({ message: 'El token no es válido.' });
        }
        req.user = payload;
        next();
    }
}