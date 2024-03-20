// imports
const mysql = require('mysql2');
const inquirer = require('inquirer');
const pass = require('./creds');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: pass,
    database: 'employee_tracker_db'
});

const actions = {
    'View all departments': viewDepartments,
    'View all roles': viewRoles,
    'View all employees': viewEmployees,
    'Add a department': addDepartment,
    'Add a role': addRole,
    'Add an employee': addEmployee,
    'Update an employee role': updateEmployeeRole,
    'Update employee manager': updateEmployeeManager,
    'View employees by manager': viewEmployeesByManager,
    'Delete department': deleteDepartment,
    'Delete role': deleteRole,
    'Delete employee': deleteEmployee,
    'View department budget': viewDepartmentBudget,
    'Exit': exitApp
};

function startApp() {
    inquirer.createPromptModule({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: Object.keys(actions)
    })
    .then(answer => {
        const action = actions[answer.action];
        if (action) {
            action();
        } else {
            console.log('Invalid action.')
            startApp();
        }
    });
};

function viewDepartments() {
    db.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        console.table(results);
        startApp();
    });
};

function closeConnection() {
    db.end(err => {
        if (err) throw err;
        console.log('Connection closed.');
    });
};

function exitApp() {
    console.log('Exiting application...');
    db.closeConnection();
    process.exit(0);
};

startApp();