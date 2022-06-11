// IMPORTAÇÃO DE PACOTES NECESSÁRIOS
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const { realpathSync } = require('fs');
require("./models/Postagem");
const Postagem = mongoose.model('postagens')
require("./models/Categoria");
const Categoria = mongoose.model('categorias');
const usuario = require('./routes/usuario');
const passport = require('passport');
require("./config/auth")(passport);
const db = require('./config/db');



// CONFIGURAÇÕES
    // SESSÃO
        app.use(session({
            secret: "testedocrud",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());

    // MIDDLEWARE
        app.use((req,res,next)=>{
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error");
            res.locals.user = req.user || null;
            next();
        })

    // TEMPLATE ENGINE
        app.engine("handlebars",handlebars.engine({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars')

    // BODY-PARSER
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    // MONGOOSE
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(()=>{
            console.log("Conectado ao DataBase");
        }).catch((err)=>{
            console.log("Erro na conexão com o DataBase: "+err);
        });

    // PUBLIC
        app.use(express.static(path.join(__dirname,'public')));



// ROTAS
    // RECEBE A REQUISIÇÃO DO TIPO GET PARA A PÁGINA PRINCIPAL
    app.get('/',(req,res)=>{
        // BUSCA TODAS AS POSTAGENS, RENDERIZA A RESPECTIVA VIEW E ENVIA AS POSTAGENS PARA SEREM EXIBIDAS
        Postagem.find().lean().populate("categoria").then((postagens)=>{
            res.render("index", {postagens: postagens});
        }).catch((err)=>{
            // SE NÃO FOI POSSÍVEL BUSCAR AS POSTAGENS, SERÁ RENDERIZADA A PÁGINA DE ERRO 404 E SERÁ ENVIADA UMA MENSAGEM DE ERRO
            req.flash("error_msg","Houve um erro ao listar as postagens");
            res.redirect("/404");
        })
       
    })

// RECEBE A REQUISIÇÃO DO TIPO GET COM UM SLUG PARA EXIBIR A POSTAGEM A ELE ASSOCIADA
    app.get('/postagem/:slug',(req,res)=>{
        // BUSCA A POSTAGEM QUE POSSUI O SLUG ESPECIFICADO
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                // SE A POSTAGEM FOI ENCONTRADA, A PÁGINA QUE A EXIBE É RENDERIZADA E A POSTAGEM É ENVIADA PARA ELA
                res.render("postagem/index",{postagem: postagem})
            }
            else{
                // SE A POSTAGEM NÃO FOI ENCONTRADA, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA PRINCIPAL E SERÁ ENVIADA A MENSAGEM DE ERRO
                req.flash("error_msg","Essa Postagem não existe");
                res.redirect("/");
            }
        }).catch((err)=>{
            // SE HOUVE UM ERRO AO BUSCAR A POSTAGEM, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA PRINCIPAL E SERÁ ENVIADA A MENSAGEM DE ERRO
            req.flash("error_msg","Houve um erro ao exibir a postagem");
            res.redirect("/");
        })
    })

    app.get('/categorias',(req,res)=>{
        // BUSCA TODAS AS CATEGORIAS
        Categoria.find().lean().then((categorias)=>{
            res.render("categoria/index", {categorias: categorias});
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao listar as categorias");
            res.redirect("/");
        })
    })

    app.get('/categoria/:slug', (req,res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if (categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render("categoria/postagens", {postagens: postagens, categoria: categoria});
                }).catch((err)=>{
                    req.flash("error_msg","Houve um erro ao listar as postagens");
                    res.redirect("/categorias");
                })
            }
            else{
                req.flash("error_msg","A categoria não existe");
                res.redirect("/categorias");
            }
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao buscar pela categoria");
            res.redirect("/categorias");
        })
    })

    

    app.get('/404',(req,res)=>{
        res.send("Desculpe :(");
    })

    app.use('/admin',admin);
    app.use('/usuario',usuario);




// SETA A PORTA DE EXECUÇÃO COMO 8081, SE DISPONÍVEL. EM CASO CONTRÁRIO SETA COMO QUALQUER PORTA DISPONÍVEL
const port = process.env.PORT || 8081;
// RODA A APLICAÇÃO NA PORTA ESPECIFICADA
app.listen(port, ()=>{
    console.log("Servidor rodando na porta "+port);
});
