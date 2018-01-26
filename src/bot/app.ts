import { Client } from 'discord.js';
import { Account } from 'fatec-api';
import { Dialog } from './models/Dialog';
import { Student } from './models/Student';

const bot = new Client();

var users: { [id: string] : Student; } = {};

bot.on('ready', () => {
    console.log('Estou pronto chefe'); 
});

bot.on('message', message => {
        
    if (message.content == '!Começar') {
    
        message.reply('Olá! Seja bem-vindo, vou ajudar você com o SIGA =D');
        message.reply('Para que eu possa acessar suas informações, você deve configurar o usuário e senha\n' + 
        'Para isso utilize: \nset user SEU_USUARIO && password SUA_SENHA');
        message.reply('Após realizar a configuração, digite !Comandos, para ver como interagir comigo');
    
    } else if (message.content.slice(0, 3) == 'set'){
        
        try {
            Dialog.register(message).then((testAccount) =>  {
                users[message.author.id] = testAccount;
            }); 
        } catch {
            message.reply('É necessário antes registrar sua conta.\n' +
                            'Para isso use: set user SEU_USUARIO && password SUA_SENHA');
        }
        
    }
    
    else if (message.content == '!Comandos') {
        message.reply(Dialog.comands());
    } 
    
    else if (message.content == '!Horario') {
        
        try {
            Dialog.horario(message, users[message.author.id]);
        } catch {
            message.reply('É necessário antes registrar sua conta.\n' +
                            'Para isso use: set user SEU_USUARIO && password SUA_SENHA');
        }
    } 
    
    else if (message.content == '!Matriculadas') {

    } 
    
    else if (message.content == '!Calendario') {

    } 
    
    else if (message.content == '!Faltas') {

    }

    else if (message.content == '!Perfil') {
        
        if (users[message.author.id] == undefined) {
            message.reply('Primeiro é necessário configurar sua conta, para que eu possa acessar o SIGA');
            message.reply('Utilize o comando: set user SEU_USUARIO && password SUA_SENHA');
        } else {
            message.reply('Nome: ' + users[message.author.id].fullName);
            message.reply('RG: ' + users[message.author.id].myAccount.username.slice(0, -2));
        }
    }
});

bot.login('DISCORD TOKEN');
