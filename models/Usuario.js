// IMPORTA O PACOTE MONGOOSE E O SUBPACOTE SCHEMA PARA MODELAR A CLASSE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CRIAÇÃO DA CLASSE "Usuario" COM SEUS RESPECTIVOS ATRIBUTOS 
const Usuario = new Schema({
    nome: {
        // ATRIBUI O TIPO STRING AO ATRIBUTO "nome"
        type: String,
        // SETA O ATRIBUTO COMO REQUERIDO (NÃO NULO)
        required: true
    },
    email: {
        type: String,
        required: true,
        // SETA O ATRIBUTO COMO ÚNICO, PARA QUE NÃO HAJA DOIS USUÁRIOS COM O MESMO VALOR PARA ESSE ATRIBUTO
        unique: true
    },
    senha: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        // ATRIBUI O VALOR PADRÃO COMO FALSO PARA O ATRIBUTO, OU SEJA, SE NÃO FOR ESPECIFICADO QUE ELE DEVE RECEBER O VALOR "true", NO MOMENTO DA INSERÇÃO NO BANCO DE DADOS RECEBERÁ "false" 
        default: false
    }
})

// EXPORTA A CLASSE USUÁRIO COM O NOME "usuarios"
mongoose.model('usuarios', Usuario);
