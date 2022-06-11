// IMPORTA O PACOTE MONGOOSE E O SUBPACOTE SCHEMA PARA MODELAR A CLASSE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CRIAÇÃO DA CLASSE "Postagem" COM SEUS RESPECTIVOS ATRIBUTOS
const Postagem = new Schema({
    titulo: {
        // ATRIBUI O TIPO STRING AO ATRIBUTO "titulo"
        type: String,
         // SETA O ATRIBUTO COMO REQUERIDO (NÃO NULO)
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        // ATRIBUI O TIPO ID DE OBJETO AO ATRIBUTO "categoria"
        type: Schema.Types.ObjectId,
        // INFORMA QUE ESSE ATRIBUTO FARÁ REFERÊNCIA A UM OBJETO DA CLASSE CATEGORIA
        ref: "categorias",
        required: true
    },
    data: {
        type: Date,
        // ATRIBUI O VALOR PADRÃO COMO A DATA ATUAL PARA O ATRIBUTO, OU SEJA, SE NÃO FOR ESPECIFICADO O VALOR QUE ELE DEVE RECEBER, NO MOMENTO DA INSERÇÃO NO BANCO DE DADOS RECEBERÁ A DATA ATUALIZADA
        default: Date.now()
    }
})

// EXPORTA A CLASSE POSTAGEM COM O NOME "postagens"
mongoose.model("postagens", Postagem);
