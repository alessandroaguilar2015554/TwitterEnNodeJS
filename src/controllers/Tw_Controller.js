'use strict'

var User = require('../models/Tw_User');
var Tweet = require('../models/Tw_Main');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var auth = require('../middlewares/authenticated');


//FUNCION PRINCIPAL PARA COMMANDOS--------------------------------------------------------------------------------------------------------------------------------

function commands(req, res){
    var user = new User();
    var tweet = new Tweet();
    var params = req.body;
    var UserInf = Object.values(params); 
    var comando = UserInf.toString().split(" ");


    

//-------------------------------------------------COMANDOS PARA USUARIO----------------------------------------------------------------------------



//REGISTRAR USUARIO NUEVO----------------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'REGISTER'){
    if(comando[1] != null && comando[2] != null && comando[3] != null && comando[4] != null){
            
            User.findOne({ $or: [
                { email: comando[2] }, 
                { username: comando[3] }

                ]},(err, userSe)=>{
                if(err){return res.status(500).send({ message: 'Error en la peticion de registro Twitter'})

                    }else if(userSe){res.status(500).send({ message: 'El usuario o correo ya se encuentra en uso' })
                    }else{
                        user.name = comando[1];
                        user.email = comando[2];
                        user.username = comando[3];
                        user.password = comando[4];

                bcrypt.hash(comando[4], null, null, (err, hash)=>{
                    user.password = hash;

                    user.save((err, userG)=>{
                        if(err){return res.status(500).send({ message: 'Error al guardar el usuario nuevo' })

                        }if(userG){
                            res.status(200).send({ user: userG})
                        }else{
                            res.status(404).send({ message: 'No se ha podido registrar al usuario' })
                        }
                    })

                })

            }

        })

        }else{
            res.status(200).send({ 
            message: 'Rellene los datos necesarios para su registro' 
        })
            
    }

    }


    
//ACCEDER CON USUARIO EXISTENTE------------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'LOGIN'){
    if(comando[1] != null && comando[2] != null){

        User.findOne({ $or: [
            { username: comando[1] }, 
            { email: comando[1] }] },

        (err, userSe)=>{
            if(err){ return res.status(500).send({ message: 'Error en la peticion de inicio de sesion' })
                }else if(userSe){ bcrypt.compare(comando[2], userSe.password, (err, check)=>{

            if(err){ return res.status(500).send({ message: 'Error en la peticion' })
                }else if(check){
                    if(comando[3] = 'true'){res.send({ token: jwt.createToken(userSe) });
                        }else{
                         res.status(200).send({ user: userSe });
                            }
                        }else{
                           return res.status(500).send({ message: 'La contraseña escrita es incorrecta' })
                            }
                        });

                    }else{
                       return res.status(404).send({ message: 'Error al escribir el usuario o el usuario no existe' });
                    }
                });

        }else{
            res.status(200).send({ 
            message: 'Rellene los datos necesarios para logearse' 
        })

        }
    }


//VER PERFIL DE USUARIO EXISTENTE----------------------------------------------------------------------------------------------------------------------------------
    
    if(comando[0] == "PROFILE"){
        var username = comando[1];
        
        
        User.find({$or: [{ username: { $regex: "^" + comando[1], $options: "i" }}],}, (err, userSe)=>{
          if(err){return res.status(404).send({ message: "Error en la peticion", err });
                }else if(userSe){return res.send({ profile: "Perfil de usuario:", userSe });
          
                    }else{res.status(200).send({ 
                    message: "Rellene los datos para mostrar perfil de usuario"
                    });
         
                }
    
            });
      
        }





//--------------------------------------------------------COMANDOS FOLLOW/UNFOLLOW--------------------------------------------------------------------




//SEGUIR A UN USUARIO EXISTENTE--------------------------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'FOLLOW'){
        if(comando[1] != null){
    
    
        User.findOne({ username: { $regex: comando[1], $options: 'i' } }, (err, userSe)=>{
            
            if(err){ return res.status(500).send({ message: 'Error en la peticion de seguir a un usuario' })
                }else if(userSe){
                            
        User.findOneAndUpdate({ username: comando[1] }, { $push: { followers: req.user.sub } }, { new: true }, (err, followed)=>{
            
            if(err){return res.status(500).send({ message: 'Error en la peticion' })
                }else if(followed){res.send({ user: followed });
                    
                }else{return res.status(404).send({ message: 'No se pudo seguir al usuario especificado' })} });
                    }else{return res.status(200).send({ message: 'No se ha encontrado al usuario especificado' })} });
                
    
                }else{
                    res.status(200).send({
                    message: 'Rellene los datos para seguir a un usuario' 
                })
            }
        }


//DEJAR DE SEGUIR A UN USUARIO EXISTENTE---------------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'UNFOLLOW'){
        if(comando[1] != null){
    
    
        User.findOne({username: {$regex: comando[1], $options: 'i'} }, (err, userSe)=>{
                        
            if(err){ return res.status(500).send({message: 'Error en la peticion de dejar de seguir al usuario'});
                }else if(userSe){ 
    
        User.findOneAndUpdate({username: comando[1]},{$pull:{followers: auth.idUser}}, {new:true}, (err, unfollow)=>{
                                        
            if(err){return res.status(500).send({message: 'Error en la peticion'})
                }else if(unfollow){return res.send({message: 'Comando unfollow aplicado a ' + comando[1]})
                                        
                    }else{return res.status(404).send({message: 'No se pudo dejar de seguir al usuario especificado'})} });
                        }else{return res.status(500).send({message: 'No se ha encontrado al usuario especificado'})} });
    
    
    
                }else{
                    res.status(200).send({
                    message: 'Rellene los datos para dejar de seguir al usuario especificado'
                });
          
            }
        }





//-----------------------------------------------------------COMANDOS PARA TWEETS---------------------------------------------------------------------------



//AGREGAR UN NUEVO TWEET-----------------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'ADD_TWEET'){
    if(comando[1] != null){

        tweet.contenido = comando.join(' ');
        tweet.contenido = tweet.contenido.replace(' ');
        tweet.contenido = tweet.contenido.replace(' ',' ');

            tweet.save((err, tweetG)=>{
                if(err){return res.status(500).send({ message: 'Error en la peticion agregar nuevo tweet' })
                    }else if(tweetG) {res.send({ tweet: tweetG });

                }else{
                   return res.status(404).send({ message: 'Error al publicar tweet nuevo' })
                }
            });

        }else{
            res.status(200).send({ 
            message: 'Rellene una descripcion a su tweet' 
        })

        }
    }


//EDITAR UN TWEET EXISTENTE--------------------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'EDIT_TWEET'){
    if(comando[1] != null){
    if(comando[2] != null){

        tweet.contenido = comando.join(' ');
        tweet.contenido = tweet.contenido.replace(' ', '');
        tweet.contenido = tweet.contenido.replace(comando[1], '');
        tweet.contenido = tweet.contenido.replace('  ', '');
        var update = tweet.contenido;
       
        Tweet.findByIdAndUpdate(comando[1], { $set: { contenido: update } }, { new: true }, (err, tweetAc)=>{
                        
            if(err){ return res.status(500).send({ message: 'Error en la peticion editar tweet' })
                }else if(tweetAc){res.status(200).send({ tweet: tweetAc });
                    }else{res.status(404).send({ message: 'No se pudo actualizar el tweet deseado' })}
                   
                });
                
            }else{
                res.status(200).send({ 
                message: 'Rellene contenido para actualizar' 
            })
               
        }

            }else{
                res.status(200).send({ 
                message: 'Rellene los datos necesarios'
            });

        }
    }


//BORRAR UN TWEET EXISTENTE------------------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'DELETE_TWEET'){
    if(comando[1] != null){


    User.findByIdAndUpdate(req.user.sub, { $pull: { tweets: comando[1] } }, { new: true }, (err, deleted)=>{
                    
        if(err){ return res.status(500).send({ message: 'Error en la peticion de eliminar tweet' })
            }else if(deleted){

    Tweet.findByIdAndRemove(comando[1], (err, tweetSe)=>{
        if(err){return res.status(500).send({ message: 'Error en la peticion' })
            }else if(tweetSe){res.send({ user: deleted });
                }else{return res.status(404).send({ message: 'Error al buscar tweet' })
                            
            }
                       
        });
                    
    }else{return res.status(404).send({ message: 'Error al eliminar tweet deseado' })}
                
        });

            }else{
                res.status(200).send({ 
                message: 'Rellene los datos para eliminar tweet'
             });
        }
    }


//VER TODOS LOS TWEETS CREADOS----------------------------------------------------------------------------------------------------------------------

    if(comando[0] == 'VIEW_TWEETS'){
    if(comando[1] != null){


    User.findOne({ username: { $regex: comando[1], $options: 'i' } }, (err, userSe)=>{
        
        if(err){ return res.status(500).send({ message: 'Error en la peticion de ver todos los tweets' })
            }else if(userSe){

    User.find({ username: comando[1] }, { tweets: 1, _id: 0 }, (err, tweets)=>{
        if(err){return res.status(500).send({ message: 'Error en la peticion' });
            }else{Tweet.populate(tweets,{path:"Total de tweets realizados"},(err,tweets)=>{
                
                if(err){return res.status(500).send({ message: 'Error en los tweets guardados' })
                    }else if(tweets){res.send({ user: comando[1], tweets });
                
                        }else{return res.status(404).send({ message: 'No se pueden mostrar todos los tweets' })}
                                
                    });
                    
                }
                
            });
                    
        }else{
            res.status(200).send({ message: 'No se han encontrado tweets de ese usuario' })}
                
        });
            
    
    }else{
            res.status(200).send({
            message: 'Rellene los datos necesarios para mostrar los tweets'
        });
            
    }
        
}




 }





module.exports = {
    commands
}