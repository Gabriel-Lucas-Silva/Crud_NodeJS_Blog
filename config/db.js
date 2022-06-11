// VERIFICA SE A APLICAÇÃO ESTÁ EM AMBIENTE DE PRODUÇÃO PARA SETAR O BANCO DE DADOS A SER UTILIZADO (SE O BANCO DE DADOS DA PRODUÇÃO OU O BANCO DE DADOS DE TESTE)
if (process.env.NODE_ENV == 'production'){
    module.exports = {
        // SETA O BANCO DE DADOS COMO O BANCO DE PRODUÇÃO
        mongoURI: "mongodb+srv://gabriel_teste:xyz.mongodb.net/test"
    }
}
else{
    module.exports = {
        // SETA O BANCO DE DADOS COMO O BANCO DE TESTE
        mongoURI: "mongodb://localhost/crud"
    }
}
