'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

var secret = 'clave_secreta_TwitterDB'

exports.createToken = function(user){
    var payload={
        sub: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        
        iat: moment().unix(),
        exp: moment().day(30, 'days').unix()
    }

    return jwt.encode(payload, secret)
}