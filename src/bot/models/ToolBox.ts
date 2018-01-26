class ToolBox{
    
    /** Método para formatar data **/
    static dateFormat(date: Date): string {
        
        let ano;
        let mes; let _mes;
        let dia; let _dia;
        
        dia = date.getDate();
        
        if (dia.toString().length == 1) {
            _dia =  "0" + dia;
        } else {
            _dia = dia;
        }

        mes = date.getMonth() + 1;

        if (mes.toString().length == 1) {
            _mes = "0" + mes;
        } else {
            _mes = mes;
        }
    
        ano = date.getFullYear();  
        return _dia + "/" + _mes + "/" + ano;
    }
}

export { ToolBox };