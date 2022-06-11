// IMPORTAÇÃO DE PACOTES NECESSÁRIOS
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");


module.exports = function(passport){

    // AUTENTICAÇÃO POR EMAIL E SENHA
    passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, (email,senha,done)=>{
        // BUSCA UM USUÁRIO QUE POSSUA O EMAIL ESPECIFICADO
        Usuario.findOne({email: email}).then((usuario)=>{
            if (!usuario){
                // SE NÃO FOR ENCONTRADO UM USUÁRIO COM O EMAIL ESPECIFICADO, INFORMARÁ QUE NENHUMA CONTA FOI AUTENTICADA E ENVIARÁ A MENSAGEM DE ERRO
                return done(null,false,{message: "Essa Conta não existe"});
            }
            else{
                // SE FOR ENCONTRADO UM USUÁRIO COM O EMAIL ESPECIFICADO, AS SENHAS DIGITADA E CADASTRADA SERÃO COMPARADAS
                bcrypt.compare(senha, usuario.senha, (erro,batem)=>{
                    if(batem){
                        // SE AS SENHAS SÃO IGUAIS, RETORNA O USUÁRIO ENCONTRADO
                        return done(null, usuario);
                    }
                    else{
                        // SE AS SENHAS SÃO DIFERENTES, INFORMARÁ QUE NENHUMA CONTA FOI AUTENTICADA E ENVIARÁ A MENSAGEM DE ERRO
                        return done(null, false, {message: "Senha Incorreta"});
                    }
                })
            }
        })
    }))


    // CRIA UMA SESSÃO COM OS DADOS DO USUÁRIO
    passport.serializeUser((usuario, done)=>{
        done(null,usuario._id)
    })

    passport.deserializeUser((id,done)=>{
        Usuario.findById(id,(err,usuario)=>{
            done(err, usuario);
        })
    })

}
