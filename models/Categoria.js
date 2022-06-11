// IMPORTA O PACOTE MONGOOSE E O SUBPACOTE SCHEMA PARA MODELAR A CLASSE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CRIAÇÃO DA CLASSE "Categoria" COM SEUS RESPECTIVOS ATRIBUTOS 
const Categoria = new Schema({
    nome: {
        // ATRIBUI O TIPO STRING AO ATRIBUTO "nome"
        type: String,
        // SETA O ATRIBUTO COMO REQUERIDO (NÃO NULO)
        required: true
    },
    slug: {
        type: String,
        required: true,
        // SETA O ATRIBUTO COMO ÚNICO, PARA QUE NÃO HAJA DUAS CATEGORIAS COM O MESMO VALOR PARA ESSE ATRIBUTO
        unique: true
    },
    date: {
        type: Date,
        // ATRIBUI O VALOR PADRÃO COMO A DATA ATUAL PARA O ATRIBUTO, OU SEJA, SE NÃO FOR ESPECIFICADO O VALOR QUE ELE DEVE RECEBER, NO MOMENTO DA INSERÇÃO NO BANCO DE DADOS RECEBERÁ A DATA ATUALIZADA
        default: Date.now()
    }
})

// EXPORTA A CLASSE CATEGORIA COM O NOME "categorias"
mongoose.model('categorias', Categoria);
