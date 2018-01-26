import { Student } from './Student';
import { Account } from 'fatec-api';
import { Message } from 'discord.js';
import { Q } from 'q';

class Dialog{

    static comands(): string {
        return '!Horario - Devolve seu horário\n' +
                '!Matriculadas - Devolve as disciplinas em que você está matriculado (a)\n' +
                '!Calendario - Devolve os eventos que irão ocorrer no mês\n' +
                '!Faltas - Devolve suas faltas nas disciplinas matriculadas\n' +
                '!Perfil - Devolve informações de seu perfil recuperadas do SIGA';
    }

    /** Método para realizar teste de conexão com o SIGA 
     * - Este método registra os dados na classe Student criada pelo bot.
     **/
    static async register(message: Message): Promise<any> {
        
        var msg: string = message.content;
        var mid: number = msg.indexOf('&&');

        var user: string = msg.slice(9, mid - 1);
        var password: string = msg.slice(mid + 12);
  
        // Conta utilizada para testar a conexão
        var testAccount = new Account(user, password);
        // Após ter a conexão feita com sucesso, ela é regitrada dentro de Student
        var student: Student = new Student(user, password, testAccount);
          
        // Realizando teste de login
        await testAccount.login().then(() => {});
        await testAccount.getName().then(nome => {
            student.fullName = nome;
        });

        return new Promise((resolve, reject) => {
            if (testAccount.isLogged()){
                message.reply('Conexão efetuada com sucesso. Agora veja os comandos para realizar as pesquisas.\n');
                message.reply(Dialog.comands());
                resolve(student);
            } else {
                message.reply('Erro ao tentar realizar conexão com o SIGA. Tente inserir as informações novamente');
                reject('Erro na comunicação com o SIGA');
            }
        })
    }

    /** Método para aquisição do horário do aluno 
    * - Este método não salva nenhuma informação, isso para que sempre a API seja consultada
    **/
    static async horario(message: Message, student: Student): Promise<any> {
        
        let diasSemana = ['', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira','Sexta-feira'];

        let _horarios = [];
        
        await student.myAccount.getSchedules().then((horarios) => {
            _horarios = horarios;
        });

        for (let horario of _horarios) {
            message.reply('Dia da semana: ' + diasSemana[horario.weekday]);
            message.reply('Horários:');

            for (let materia of horario.periods) {
                
                message.reply('Nome: ' + materia.discipline.name + 
                              '\nCódigo: ' + materia.discipline.code + 
                              '\nHorário de início: ' + materia.startAt +
                              '\nHorário de término: ' + materia.startAt);
            };
        }
    }
}


export { Dialog } ;