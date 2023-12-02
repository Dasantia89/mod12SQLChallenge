// Require needed npm modules
const mysql = require('mysql2');
require('dotenv').config();
var inquirer = require('inquirer');
const { printTable } = require('console-table-printer');

// Questions for inquirer
const questions = [
    {
        type: 'list',
        name: 'choice',
        message: 'What do you want to do?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role']
    }
];


// Ask questions, receive answers, and formulate and run queries based on them. Then display the results
async function init() {
    var query;
    var isDisplayed = false;
    const answers = await inquirer.prompt(questions);

    const db = mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });


    if (answers.choice == 'View all departments') {
        query = 'SELECT * FROM departments;';
        isDisplayed = true;
    } else if (answers.choice == 'View all roles') {
        query = 'SELECT * FROM roles;';
        isDisplayed = true;
    } else if (answers.choice == 'View all employees') {
        query = 'SELECT * FROM employees;';
        isDisplayed = true;
    } else if (answers.choice == 'Add a department') {
        const answers2 = await inquirer.prompt([{ type: 'input', name: 'dept', message: 'What is the name of the department you want to add?' }])
        query = `INSERT INTO departments (name) VALUES ("${answers2.dept}");`
        console.log('Department added.')
        db.end();
        return;
    } else if (answers.choice == 'Add a role') {
        var depts;
        db.query('SELECT name FROM departments;', function (err, results) {
            depts = results.map((dept) => dept.name)
        })
        const answers2 = await inquirer.prompt([{ type: 'input', name: 'name', message: 'What is the name of the role?' }]);
        const answers3 = await inquirer.prompt([{ type: 'input', name: 'salary', message: 'What is the salary of the role?' }]);
        const answers4 = await inquirer.prompt([{ type: 'rawlist', name: 'dept', message: 'What department does the role belong to?', choices: depts }])

        var deptQuery = `SELECT id FROM departments WHERE name = "${answers4.dept}";`;
        db.query(deptQuery, function (err, results) {
            query = `INSERT INTO roles (title, salary, department_id) VALUES ("${answers2.name}",${answers3.salary},${results[0].id});`;
            db.query(query, function (err, results, fields) {
                console.log('Role added.')
            });
        })
        db.end();
        return;
    }
    // For simple select statements only
    if (isDisplayed) {
        db.query(query, function (err, results) {
            printTable(results);
        }
        )
        db.end();
        return;
    }
}
    // Function call to initialize app
init();
