// IMPORTAÇÃO DE PACOTES NECESSÁRIOS
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require('passport')

// RECEBE A REQUISIÇÃO DO TIPO GET PARA A PÁGINA ESPECIFICADA (registro) E RENDERIZA A RESPECTIVA VIEW (registro, QUE ESTÁ NO DIRETÓRIO views/usuario)
// ROTA UTILIZADA PARA O PREENCHIMENTO DO FORMULÁRIO DE CADASTRO DE USUÁRIOS
router.get('/registro', (req,res)=> {
    res.render("usuario/registro")
})

// RECEBE A REQUISIÇÃO DO TIPO POST PARA A PÁGINA ESPECIFICADA (registro)
// ROTA UTILIZADA PARA SALVAR O CADASTRO DO USUÁRIO NO BANCO DE DADOS
router.post('/registro', (req,res)=>{
    var erros=[];

    // VALIDA CADA CAMPO DO FORMULÁRIO E, SE HOUVER ALGUM ERRO, ESTE SERÁ ACRESCIDO AO ARRAY DE ERROS PARA, POSTERIORMENTE, SER EXIBIDO NA PÁGINA
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail Inválido"})
    }
    if(!req.body.senha1 || typeof req.body.senha1 == undefined || req.body.senha1 == null){
        erros.push({texto: "Senha Inválida"})
    }
    if(req.body.senha1 != req.body.senha2){
        erros.push({texto: "As senhas não coincidem"})
    }

    // SE HOUVER ALGUMA MENSAGEM NO ARRAY DE ERROS, A PÁGINA DO FORMULÁRIO SERÁ NOVAMENTE RENDERIZADA E RECEBERÁ O ARRAY PARA EXIBÍ-LAS
    if(erros.length > 0){
        res.render("usuario/registro", {erros: erros});
    }
    // SE AS INFORMAÇÕES FORAM APROVADAS NA VALIDAÇÃO (SEM ERROS NO ARRAY), DARÁ PROSSEGUIMENTO AO PROCESSO DE CADASTRO DO USUÁRIO
    else{
        // BUSCA UM USUÁRIO JÁ SALVO NO BANCO DE DADOS QUE POSSUA O MESMO ENDEREÇO DE EMAIL INFORMADO PELO USUÁRIO QUE ESTÁ TENTANDO SE CADASTRAR
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            // SE JÁ HOUVER UM CADASTRO COM O EMAIL INFORMADO, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA PRINCIPAL E SERÁ ENVIADA A MENSAGEM DE ERRO
            if(usuario){
                req.flash("error_msg","Já existe um usuário cadastrado com esse endereço de e-mail");
                res.redirect("/");
            }
            // SE NÃO HOUVER UM CADASTRO PARA O EMAIL INFORMADO, DARÁ PROSSEGUIMENTO AO PROCESSO DE CADASTRO DO USUÁRIO
            else{
                // ENCRIPTAÇÃO DE SENHA
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(req.body.senha1, salt);

                // CRIAÇÃO DE UM NOVO OBJETO DO TIPO USUÁRIO COM AS INFORMAÇÕES DE CADASTRO FORNECIDAS
                const novo_usuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: hash
                })
                
                // TENTATIVA DE SALVAMENTO DO NOVO USUÁRIO (PELO OBJETO CRIADO) NO BANCO DE DADOS
                new Usuario(novo_usuario).save().then(()=>{
                    // SE A TENTATIVA OBTEVE SUCESSO, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA PRINCIPAL E SERÁ ENVIADA A MENSAGEM DE SUCESSO
                    req.flash("success_msg","Usuário cadastrado com Sucesso!");
                    res.redirect("/");
                
                }).catch((err)=>{
                    // SE A TENTATIVA FRACASSOU, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA DE CADASTRO E SERÁ ENVIADA A MENSAGEM DE ERRO
                    req.flash("error_msg","Erro ao cadastrar usuário");
                    res.redirect("/usuario/registro");
                })
            }
       
        }).catch((err)=>{
             // SE A BUSCA POR UM USUÁRIO JÁ SALVO NO BANCO DE DADOS QUE POSSUA O MESMO ENDEREÇO DE EMAIL FALHOU, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA DE CADASTRO E SERÁ ENVIADA A MENSAGEM DE ERRO
            req.flash("error_msg","Erro ao realizar o cadastro: "+err);
            res.redirect("/usuario/registro");
        })
    }
})

router.get('/login',(req,res)=>{
    res.render("usuario/login")
})


router.post('/login',(req,res, next)=>{
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuario/login",
        failureFlash: true
    })(req,res,next)
})

// RECEBE A REQUISIÇÃO DO TIPO GET PARA DESLOGAR O USUÁRIO
// DESLOGA O USUÁRIO, REALIZA O REDIRECIONAMENTO PARA A PÁGINA PRINCIPAL E ENVIA A MENSAGEM DE SUCESSO
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash("success_msg","Deslogado com Sucesso!")
    res.redirect("/");
})

module.exports = router
