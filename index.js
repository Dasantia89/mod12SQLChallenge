// Require needed npm modules
const mysql = require('mysql2/promise');
require('dotenv').config();
var inquirer = require('inquirer');
const { printTable } = require('console-table-printer');

// Questions for inquirer
const questions = [
    {
        type: 'list',
        name: 'choice',
        message: 'What do you want to do?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'View employees by manager', 'View employees by department', 'View budget of department', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit']
    }
];
console.log('Employee Management System');

// Ask questions, receive answers, and formulate and run queries based on them. Then display the results
async function init() {
    var query;
    var isSelectQuery = false;
    const answers = await inquirer.prompt(questions);

    // Create database connection
    const db = mysql.createPool({
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true
    });

    // Form the select queries
    if (answers.choice == 'View all departments') {
        query = 'SELECT * FROM departments;';
        isSelectQuery = true;
    } else if (answers.choice == 'View all roles') {
        query = 'SELECT * FROM roles;';
        isSelectQuery = true;
    } else if (answers.choice == 'View all employees') {
        query = 'SELECT * FROM employees;';
        isSelectQuery = true;
    } else if (answers.choice == "View employees by manager") {
        var [results] = await db.query('SELECT first_name, last_name, id FROM employees WHERE manager_id IS NULL;');
        var leads = results.map((name) => name.id + ' ' + name.first_name + ' ' + name.last_name);

        const answers2 = await inquirer.prompt({ type: 'list', name: 'empMan', message: "Which manager's employees would you like to view?", choices: leads });
        var manager = answers2.empMan.split(' ');
        var id = manager[0];
        query = (`SELECT * FROM employees WHERE manager_id = ${id};`);
        isSelectQuery = true;
    } else if (answers.choice == "View employees by department") {
        var [results] = await db.query('SELECT * FROM departments;');
        depts = results.map(dept=>dept.id + ' ' + dept.name)
        const answers2 = await inquirer.prompt({ type: 'list', name: 'dept', message: "Which department's employees would you like to view?", choices: depts });
        var dept = answers2.dept.split(' ');
        var id = dept[0];
        query = (`SELECT departments.name AS 'Department', roles.title AS 'Role', employees.first_name AS 'First name', employees.last_name AS 'Last name' FROM departments JOIN roles ON departments.id = roles.department_id JOIN employees ON roles.id = employees.role_id WHERE departments.id = ${id};`);
        isSelectQuery = true;
    } else if (answers.choice == 'View budget of department') {
        var [results] = await db.query('SELECT * FROM departments;');
        depts = results.map(dept=>dept.id + ' ' + dept.name)
        const answers2 = await inquirer.prompt({ type: 'list', name: 'dept', message: "Which department budget would you like to view?", choices: depts });
        var dept = answers2.dept.split(' ');
        var id = dept[0];
        
        query = `SELECT departments.name AS 'Department', SUM(roles.salary) AS 'Budget' FROM departments JOIN roles ON departments.id = roles.department_id WHERE departments.id = ${id}`;
        isSelectQuery = true;
    }
    // Get the name of the department and add it to the departments table
    else if (answers.choice == 'Add a department') {
        const answers2 = await inquirer.prompt([{ type: 'input', name: 'dept', message: 'What is the name of the department you want to add?' }]);
        query = `INSERT INTO departments (name) VALUES ("${answers2.dept}");`
        var x = await db.query(query);
        console.log('Department added.');
        db.end();
    }
    // Get list of departments. Then get role information. Get role id based on that information. Then insert new role.
    else if (answers.choice == 'Add a role') {
        var [results] = await db.query('SELECT name FROM departments;');
        var depts = results.map((department) => department.name);
        const answers2 = await inquirer.prompt([{ type: 'input', name: 'name', message: 'What is the name of the role?' }]);
        const answers3 = await inquirer.prompt([{ type: 'input', name: 'salary', message: 'What is the salary of the role?' }]);
        const answers4 = await inquirer.prompt([{ type: 'list', name: 'dept', message: 'What department does the role belong to?', choices: depts }])

        var deptQuery = `SELECT id FROM departments WHERE name = "${answers4.dept}";`;
        var [results] = await db.query(deptQuery);


        query = `INSERT INTO roles (title, salary, department_id) VALUES ("${answers2.name}",${answers3.salary},${results[0].id});`;
        await db.query(query);
        console.log('Role added.')
        db.end();
    }
    // Get every role title and every first and last name of every manager. Get new employee data. Retrieve role id and manager id. Run query. 
    else if (answers.choice == 'Add an employee') {
        var [results] = await db.query('SELECT title FROM roles;');
        var roles = results.map((role) => role.title);
        var [results] = await db.query('SELECT first_name, last_name FROM employees WHERE manager_id IS NULL;');
        var leads = results.map((name) => name.first_name + ' ' + name.last_name);



        const answers2 = await inquirer.prompt([{ type: 'input', name: 'first', message: 'What is the first name of the employee?' }])
        const answers3 = await inquirer.prompt([{ type: 'input', name: 'last', message: 'What is the last name of the employee?' }])
        const answers4 = await inquirer.prompt([{ type: 'list', name: 'role', message: 'What is the role of the employee?', choices: roles }])
        const answers5 = await inquirer.prompt([{ type: 'list', name: 'manager', message: 'Who is the manager of the employee?', choices: leads }])


        var names = answers5.manager.split(' ');
        var first = names[0];
        var last = names[1];
        var [results] = await db.query(`SELECT id FROM roles WHERE title = "${answers4.role}";`);
        var roleId = results[0].id;
        var [results] = await db.query(`SELECT id FROM employees WHERE first_name = "${first}" AND last_name = "${last}";`);
        var managerId = results[0].id;

        await db.query(`INSERT INTO employees (first_name,last_name,role_id,manager_id) VALUES ("${answers2.first}", "${answers3.last}", ${roleId}, ${managerId});`);
        console.log('Employee added.');
        db.end();
    }
    // Get employee name. Get employee id from the name. Get all role titles. Get updated role. Form and run query. 
    else if (answers.choice == "Update an employee role") {
        const answers2 = await inquirer.prompt([{ type: 'input', name: 'name', message: "What is the name of the employee who's role you want to change?" }]);
        var names = answers2.name.split(' ');
        var first = names[0];
        var last = names[1];
        var [results] = await db.query(`SELECT id FROM employees where first_name = "${first}" AND last_name = "${last}";`);
        var empId = results[0].id;

        var [results] = await db.query('SELECT title FROM roles;');
        var roles = results.map((role) => role.title);
        const answers3 = await inquirer.prompt([{ type: 'list', name: 'role', message: "What do you want to cahnge the employee's role to?", choices: roles }]);
        var [results] = await db.query(`SELECT id FROM roles where title = "${answers3.role}";`);
        var roleId = results[0].id;
        await db.query(`UPDATE employees SET role_id = ${roleId} WHERE id = ${empId};`);
        console.log('Employee role updated.');
        db.end();
    }  
    // Quit option was selected
    else {
        return;
    }

    // select query was selected
    if (isSelectQuery) {
        var results = await db.query(query)
        printTable(results[0]);
        db.end();
    }

    init();
}



// Function call to initialize app
init();
