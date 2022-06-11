
module.exports = {
    admin: (req,res,next)=>{
        // VERIFICA SE O USUÁRIO ESTÁ AUTENTICADO E SE A SUA CONTA É DO TIPO ADMINISTRADOR
        if(req.isAuthenticated() && req.user.admin == true){
            return next();
        }
        else{
            // SE O USUÁRIO NÃO SE ENCAIXA NAS CONDIÇÕES ANTERIORES, É EXIBIDA A MENSAGEM ABAIXO APÓS UM REDIRECIONAMENTO PARA A PÁGINA INDEX
            req.flash('error_msg','Você não é administrador');
            res.redirect('/');
        }
    }
}
