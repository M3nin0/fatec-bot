import { Student } from './Student';
import { Account } from 'fatec-api';
import { Message, RichEmbed } from 'discord.js';
import * as Discord from 'discord.js';
import { ToolBox } from './ToolBox';
import { Q } from 'q';

class Dialog{

    static comands(): RichEmbed {
 
        let embeded: RichEmbed = new Discord.RichEmbed();

        embeded.setAuthor('O Criador');
        embeded.setColor('DARK_RED');

        embeded.addField('!Comandos', 'Exibe os comandos que poderão ser usados com o bot');
        embeded.addField('!Horario', 'Devolve seu horário');
        embeded.addField('!Matriculadas', 'Verifica as disciplinas em que você está matriculado (a)');
        embeded.addField('!Calendario', 'Devolve os eventos que irão ocorrer no mês');
        embeded.addField('!Faltas', 'Devolve suas faltas nas disciplinas matriculadas');
        embeded.addField('!Perfil', 'Devolve informações de seu perfil recuperadas do SIGA');
        embeded.addField('!Historico', 'Devolve o histórico das matérias cursadas pelo aluno');
        embeded.addField('!Ajuda', 'Para obter ajuda com a utilização do bot');

        return embeded;
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
                message.reply('Conexão efetuada com sucesso :rofl: Agora veja os comandos para realizar as pesquisas.\n');
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
    static async schedule(message: Message, student: Student) {
        
        let diasSemana = ['', 'Segunda-feira :sun_with_face: ', 'Terça-feira :dromedary_camel:',
                            'Quarta-feira :dromedary_camel: ', 
                            'Quinta-feira :free: ','Sexta-feira :smiling_imp:'];

        let _horarios = [];
        
        await student.myAccount.getSchedules().then((horarios) => {
            _horarios = horarios;
        });

        message.reply('Horários:');
        for (let horario of _horarios) {
            let richMessage: RichEmbed = new Discord.RichEmbed();

            richMessage.setAuthor('Fatec-Bot');
            richMessage.description = 'Dia da semana: ' + diasSemana[horario.weekday];

            if (richMessage == undefined) {
                break;
            }

            message.reply({embed: richMessage});
            for (let materia of horario.periods) {

                let richMessage: RichEmbed = new Discord.RichEmbed();
                richMessage.addField('Nome ', materia.discipline.name);
                richMessage.addField('Código ', materia.discipline.code);
                richMessage.addField('Horário de início ', ToolBox.hoursFormat(materia.startAt));
                richMessage.addField('Horário de término ', ToolBox.hoursFormat(materia.endAt));
                message.reply({embed: richMessage});
            };

        }
    }

    /** Método para busca de datas no calendário acadêmico
     * - Não salva nenhuma informação, sempre consulta o fatec-api
    **/
    static async calendar(message: Message, student: Student) {

        let _eventos = {'months': []};

        await student.myAccount.getAcademicCalendar().then(
            calendario => {
                _eventos = calendario;
        });

        message.reply('Veja os eventos que estão marcados no calendário semestral');
        for (let mes of _eventos.months) {
            
            let richMessage: RichEmbed = new Discord.RichEmbed();
            richMessage.setAuthor('Fatec-Bot');
            var date:any;

            for (let eventName of mes.events) {
            
                // Tratando a data recebida
                date = ToolBox.dateFormat(eventName.date);

                richMessage.addField('Nome do evento', eventName.reason);
                richMessage.addField('Tipo do evento', eventName.name);
                richMessage.addField('Data', date);
            } 

            if (date > ToolBox.dateFormat(new Date())) {
                message.reply({embed: richMessage}); 
            }          
        }
    }

    /** Método para recuperar o histórico de máterias do aluno
     * - Não salva nenhuma informação, sempre consulta o fatec-api
     **/
    static async historic(message: Message, student: Student) {
        let _historico = {'entries': []};
        let _aprovadas = '';

        await student.myAccount.getHistory().then(historico => {
            _historico = historico;
        });

        message.reply('Histórico de matérias');
        message.reply('Matérias em que você foi aprovado :apple:');
        for (let entrie of _historico.entries) {
            if (entrie.observation == 'Aprovado por Nota e Frequência') {
                _aprovadas += entrie.discipline.name + '\n';
            }
        }
        message.reply(_aprovadas);
    }

    /** Exibe a grade de máterias que o usuário está cursando */
    static async historicInProgress(message: Message, student: Student) {
        let _historico = {'entries': []};

        await student.myAccount.getHistory().then(historico => {
            _historico = historico;
        })

        message.reply('Matérias que você está cursando :construction_worker:');
        for (let entrie of _historico.entries) {
            if (entrie.observation == 'Em Curso') {
                let richMessage: RichEmbed = new Discord.RichEmbed();
                
                richMessage.addField('Nome da matéria: ', entrie.discipline.name);
                richMessage.addField('Código', entrie.discipline.code);
                richMessage.addField('Frequência', entrie.discipline.frequency + ' %');
                richMessage.addField('Período',  entrie.discipline.period);

                message.reply({embed: richMessage});
            }
        }
    }

    /** 
     * Método para consultar as matérias que o aluno está matriculado.
     *  - Não salva nenhuma informação, sempre consulta o fatec-api
    */
    static async enrolledSubjects(message: Message, student: Student) {
        let disciplinas = [];

        await student.myAccount.getEnrolledDisciplines().then(matriculadas => {
            disciplinas = matriculadas;
        });
    
        message.reply('Matérias matriculadas');
        for (var disciplina of disciplinas) {
            
            let richMessage: RichEmbed = new Discord.RichEmbed();

            richMessage.addField('Nome da matéria', disciplina.name);
            richMessage.addField('Nome do professor', disciplina.teacherName);
            
            message.reply({embed: richMessage}); 
        }
    }

    /** Método para verificar as faltas dos usuários **/
    static async absence(message: Message, student: Student) {
        let disciplinas = [];

        await student.myAccount.getEnrolledDisciplines().then(matriculadas => {
            disciplinas = matriculadas;
        });

        message.reply('Faltas nas matérias');
        for (var disciplina of disciplinas) {
            
            let richMessage: RichEmbed = new Discord.RichEmbed();

            richMessage.addField('Nome da matéria', disciplina.name);
            richMessage.addField('Nome do professor', disciplina.teacherName);
            richMessage.addField('Quantidade de faltas', disciplina.absenses);

            if (disciplina.absenses > disciplina.presences) {
                richMessage.addField(':warning:', 'Você tem mais faltas que presenças');
            }
            
            message.reply({embed: richMessage});
        }
    }
}

export { Dialog } ;
