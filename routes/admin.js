// IMPORTAÇÃO DE PACOTES NECESSÁRIOS
const express = require('express');
const { route } = require('express/lib/router');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Categoria");
const Categoria = mongoose.model('categorias');
require("../models/Postagem");
const Postagem = mongoose.model('postagens');
const {admin} = require("../helpers/verifica_admin");

// RECEBE A REQUISIÇÃO DO TIPO GET PARA A PÁGINA PRINCIPAL, VERIFICA SE O SOLICITANTE É ADMIN (ISTO SERÁ FEITO PARA TODAS AS ROTAS DESTE ARQUIVO) E, EM CASO AFIRMATIVO, RENDERIZA A RESPECTIVA VIEW (index, QUE ESTÁ NO DIRETÓRIO views/admin)
router.get('/', admin, (req,res)=>{
    res.render("admin/index");
})

router.get('/categorias', admin, (req,res)=>{
    // TENTA BUSCAR TODAS AS CATEGORIAS CADASTRADAS
    Categoria.find().lean().then((categorias)=>{
        // SE A TENTATIVA OBTEVE SUCESSO, SERÁ RENDERIZADA A PÁGINA QUE EXIBE AS CATEGORIAS E ESTAS SERÃO ENVIADAS PARA A VIEW
        res.render("admin/categorias", {categorias: categorias});
    }).catch((err)=>{
        // SE A TENTATIVA FALHOU, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA PRINCIPAL E SERÁ ENVIADA A MENSAGEM DE ERRO
        req.flash("error_msg","Houve um erro ao Listar as Categorias");
        res.redirect("/admin");
    })
    
})

router.get('/categorias/add', admin, (req,res)=>{
    res.render("admin/nova_categoria");
})

// RECEBE A REQUISIÇÃO DO TIPO POST PARA A PÁGINA ESPECIFICADA (add)
// ROTA UTILIZADA PARA SALVAR O CADASTRO DA CATEGORIA NO BANCO DE DADOS
router.post('/categorias/add', admin, (req,res)=>{
    var erros = [];

    // VALIDA CADA CAMPO DO FORMULÁRIO E, SE HOUVER ALGUM ERRO, ESTE SERÁ ACRESCIDO AO ARRAY DE ERROS PARA, POSTERIORMENTE, SER EXIBIDO NA PÁGINA
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"});
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido"});
    }

    // SE HOUVER ALGUMA MENSAGEM NO ARRAY DE ERROS, A PÁGINA DO FORMULÁRIO SERÁ NOVAMENTE RENDERIZADA E RECEBERÁ O ARRAY PARA EXIBÍ-LAS
    if (erros.length >0){
        res.render("admin/nova_categoria", {erros: erros});
    }
     // SE AS INFORMAÇÕES FORAM APROVADAS NA VALIDAÇÃO (SEM ERROS NO ARRAY), DARÁ PROSSEGUIMENTO AO PROCESSO DE CADASTRO DA CATEGORIA
    else{
        // CRIAÇÃO DE UM NOVO OBJETO DO TIPO CATEGORIA COM AS INFORMAÇÕES DE CADASTRO FORNECIDAS
        const nova_categoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        
        // TENTATIVA DE SALVAMENTO DA NOVA CATEGORIA (PELO OBJETO CRIADO) NO BANCO DE DADOS
        new Categoria(nova_categoria).save().then(()=>{
            // SE A TENTATIVA OBTEVE SUCESSO, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA QUE LISTA AS CATEGORIAS E SERÁ ENVIADA A MENSAGEM DE SUCESSO
            req.flash("success_msg","Categoria Cadastrada Com Sucesso!");
            res.redirect("/admin/categorias");
            
        }).catch((err)=>{
            // SE A TENTATIVA FRACASSOU, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA PRINCIPAL E SERÁ ENVIADA A MENSAGEM DE ERRO
            req.flash("error_msg","Erro ao Cadastrar Categoria :(");
            res.redirect("/admin");
        })
    }
})

// RECEBE A REQUISIÇÃO DO TIPO GET COM O ID DE UMA DETERMINADA CATEGORIA PARA EDITÁ-LA
router.get('/categorias/edit/:id', admin, (req,res)=>{
    // BUSCA UMA CATEGORIA SALVA NO BANCO DE DADOS QUE POSSUA O ID ESPECIFICADO
    Categoria.findOne({_id: req.params.id}).lean().then((categoria)=>{
        // SE A CATEGORIA COM O DETERMINADO ID FOI ENCONTRADA, SERÁ RENDERIZADA A PÁGINA DE EDIÇÃO E AS INFORMAÇÕES DESSA CATEGORIA SÃO ENVIADAS PARA SEREM EXIBIDAS
        res.render("admin/editar_categoria", {categoria: categoria});
    }).catch((err)=>{
        // SE A CATEGORIA NÃO FOI ENCONTRADA, SERÁ REALIZADO O REDIRECIONAMENTO PARA A PÁGINA QUE LISTA AS CATEGORIAS E SERÁ ENVIADA A MENSAGEM DE ERRO
        req.flash("error_msg", "Categoria Não Encontrada");
        res.redirect("/admin/categorias");
    })
    
})

router.post('/categorias/edit', admin, (req,res)=>{
    
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        req.flash("error_msg", "Nome Inválido");
        res.redirect("/admin/categorias");
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        req.flash("error_msg", "Slug Inválido");
        res.redirect("/admin/categorias");
    }

    else{
        Categoria.findOne({_id: req.body.id}).then((categoria)=>{
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(()=>{
                req.flash("success_msg","Categoria Editada com Sucesso!");
                res.redirect("/admin/categorias");
            }).catch((err)=>{
                req.flash("error_msg","Houve um Erro ao Editar a Categoria");
                res.redirect("/admin/categorias");
            })
        }).catch((err)=>{
            req.flash("error_msg", "Houve um Erro ao Editar a Categoria");
            res.redirect("/admin/categorias");
        })
    }
})

router.post('/categorias/del', admin, (req,res)=>{
    // TENTATIVA DE EXCLUSÃO DA CATEGORIA COM O ID ESPECIFICADO (REPASSADO NA REQUISIÇÃO PELO MÉTODO POST)
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Categoria Removida com Sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err)=>{
        req.flash("error_msg","Erro ao Remover Categoria");
        res.redirect("/admin/categorias");
    });
})

router.get('/postagens', admin, (req,res)=>{
    // BUSCA TODAS AS POSTAGENS E AS PÕE EM ORDEM DECRESCENTE DE DATA
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err)=>{
        req.flash("error_msg","Falha ao listar Postagens");
        res.redirect("/admin/postagens");
    })
    
})

router.get('/postagens/add', admin, (req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/nova_postagem", {categorias: categorias});
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao carregar o formulário");
        res.redirect("/admin/postagens");
    })
})

router.get('/categorias/add', admin, (req,res)=>{
    res.render("admin/nova_categoria");
})

router.post('/postagens/add', admin, (req,res)=>{
    var erros = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título Inválido"});
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido"});
    }
    if(!req.body.categoria || typeof req.body.categoria == undefined || req.body.categoria == null || req.body.categoria == 0){
        erros.push({texto: "Categoria Inválida"});
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição Inválida"});
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo Inválido"});
    }

    if (erros.length >0){
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/nova_postagem", {erros: erros, categorias: categorias});
        }).catch((err)=>{
            req.flash("error_msg","Falha ao listar categorias");
            res.redirect("/admin/postagens");
        })
        
    }
    else{
        const nova_postagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            categoria: req.body.categoria,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo
        }
    
        new Postagem(nova_postagem).save().then(()=>{
            req.flash("success_msg","Postagem Cadastrada Com Sucesso!");
            res.redirect("/admin/postagens");
        }).catch((err)=>{
            req.flash("error_msg","Erro ao Cadastrar Postagem :(");
            res.redirect("/admin/postagens");
        })
    }
})

router.get('/postagens/edit/:id', admin, (req,res)=>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render('admin/editar_postagem', {postagem: postagem, categorias: categorias});

        }).catch((err)=>{
            req.flash("error_msg","Falha ao listar Categorias");
            res.redirect("/admin/postagens");
        })
    
    }).catch((err)=>{
        req.flash("error_msg","Erro ao Editar Postagem");
        res.redirect("/admin/postagens");
    })
})

router.post('/postagens/edit', admin, (req,res)=>{
    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        req.flash("error_msg", "Título Inválido");
        res.redirect("/admin/postagens");
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        req.flash("error_msg", "Slug Inválido");
        res.redirect("/admin/postagens");
    }
    if(!req.body.categoria || typeof req.body.categoria == undefined || req.body.categoria == null || req.body.categoria == 0){
        req.flash("error_msg", "Categoria Inválida");
        res.redirect("/admin/postagens");
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        req.flash("error_msg", "Descrição Inválida");
        res.redirect("/admin/postagens");
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        req.flash("error_msg", "Conteúdo Inválido");
        res.redirect("/admin/postagens");
    }

    else{
        Postagem.findOne({_id: req.body.id}).then((postagem)=>{
            postagem.titulo = req.body.titulo,
            postagem.slug = req.body.slug,
            postagem.descricao = req.body.descricao,
            postagem.conteudo = req.body.conteudo,
            postagem.categoria = req.body.categoria

            postagem.save().then(()=>{
                req.flash("success_msg","Postagem Editada com Sucesso");
                res.redirect("/admin/postagens");
            })

        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao Editar a Postagem");
            res.redirect("/admin/postagens");
        })
    }
})

router.post("/postagens/del", admin, (req,res)=>{
    Postagem.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Postagem Apagada com Sucesso!");
        res.redirect("/admin/postagens");

    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao Apagar a Postagem");
        res.redirect("/admin/postagens");
    })
})

module.exports = router;

