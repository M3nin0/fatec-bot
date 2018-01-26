import { Account } from 'fatec-api';

class Student {
    fullName: string;
    constructor(public user: string, public password: string, public myAccount: Account) {}
}

export { Student } ;