const mysql = require('mysql2');
require('dotenv').config();
var inquirer = require('inquirer');
const { printTable } = require('console-table-printer');
const questions = [
    {
        type: 'list',
        name: 'choice',
        message: 'What shape should the logo have?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit']
    }
];



async function init() {
}
    // Function call to initialize app
init();
