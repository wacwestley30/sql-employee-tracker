// imports
const mysql = require('mysql2');
const inquirer = require('inquirer');
const password = require('./creds.js');

// connection with option for others to input their password for MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: password || '',
    database: 'employee_tracker_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database.');
    startApp();
});

// function are in order as they are declared
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
    'View employees by department': viewEmployeesByDepartment,
    'Delete department': deleteDepartment,
    'Delete role': deleteRole,
    'Delete employee': deleteEmployee,
    'View department budget': viewDepartmentBudget,
    'Exit': exitApp
};

// starts the CLI application
function startApp() {
    inquirer.prompt({
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

// shows all departments within the database
function viewDepartments() {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        console.table(results);
        startApp();
    });
};

// shows all roles within the database
function viewRoles() {
    const sql = `
        SELECT
            role.id AS role_id,
            role.title,
            department.name AS department,
            role.salary
        FROM
            role
        INNER JOIN
            department ON role.department_id = department.id
    `;

    db.query(sql, (err, results) => {
        if (err) throw err;
        console.table(results);
        startApp();
    });
};

// shows all employees within the database
function viewEmployees() {
    const sql = `
        SELECT
            employee.id AS employee_id,
            employee.first_name,
            employee.last_name,
            role.title,
            department.name AS department,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM
            employee
        INNER JOIN
            role ON employee.role_id = role.id
        INNER JOIN
            department ON role.department_id = department.id
        LEFT JOIN
            employee AS manager ON employee.manager_id = manager.id
    `;

    db.query(sql, (err, results) => {
        if (err) throw err;
        console.table(results);
        startApp();
    });
};

// allows user to add a department to the database
function addDepartment() {
    inquirer.prompt({
        name: 'departmentName',
        type: 'input',
        message: 'Enter the name of the department:'
    })
    .then(answer => {
        const departmentName = answer.departmentName;

        const sql = `
            INSERT INTO department (name) VALUES(?)
        `;

        db.query(sql, [departmentName], (err, result) => {
            if (err) throw err;
            console.log(`Department '${departmentName}' added successfully.`);
            startApp();
        });
    });
};

// allows user to add a role to the database
function addRole() {
    inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: 'Enter the job title of the role:'
        },
        {
            name: 'salary',
            type: 'input',
            message: 'Enter the salary for the role:'
        },
        {
            name: 'department',
            type: 'input',
            message: 'Enter the department for the role:'
        }
    ])
    .then(answers => {
        const { title, salary, department } = answers;
        const sqlId = `
            SELECT id FROM department WHERE name = ?
        `;

        db.query(sqlId, [department], (err, results) => {
            if (err) throw err;

            if (results.lengths === 0) {
                console.log(`Department '${department}' not found.`);
                startApp();
                return;
            }

            const departmentId = results[0].id;
            const sqlAddRole = `
                INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)
            `;

            db.query(sqlAddRole, [title, salary, departmentId], (err, result) => {
                if (err) throw err;
                console.log(`Role '${title}' added successfully.`);
                startApp();
            });
        });
    });
};

// allows user to add an employee to the database
function addEmployee() {
    const roleChoices = [];
    const sqlRoles = `
        SELECT id, title FROM role
    `;

    // query for the roles to select from
    db.query(sqlRoles, (err, results) => {
        if (err) throw err;
        roleChoices.push(...results.map(role => ({
            value: role.id,
            name: role.title
        })));

        const managerChoices = [];
        const sqlManagers = `
            SELECT id, CONCAT(first_name, ' ', last_name) AS manager_name FROM employee
        `;

        // query for the managers to select from
        db.query(sqlManagers, (err, results) => {
            if (err) throw err;
            // if user selects no manager
            managerChoices.push({
                value: null,
                name: 'None'
            });
            // if user selects a manager
            managerChoices.push(...results.map(manager => ({
                value: manager.id,
                name: manager.manager_name
            })));

            inquirer.prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: 'Enter the employee\'s first name:'
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: 'Enter the employee\'s last name:'
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'Select the employee\'s role:',
                    choices: roleChoices
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: 'Select the employee\'s manager:',
                    choices: managerChoices
                }
            ])
            .then(answers => {
                const { firstName, lastName, role, manager } = answers;
                const sqlAddEmployee = `
                    INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)
                `;

                // query to add the new employee to the Database
                db.query(sqlAddEmployee, [firstName, lastName, role, manager], (err, results) => {
                    if (err) throw err;
                    console.log(`Employee '${firstName} ${lastName}' added successfully.`);
                    startApp();
                });
            });
        });
    });
};

// allows user to update the employee's role within the database
function updateEmployeeRole() {
    const employeeChoices = [];
    const sqlEmployees = `
        SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employee
    `;

    // query for employees to choose from
    db.query(sqlEmployees, (err, results) => {
        if (err) throw err;
        employeeChoices.push(...results.map(employee => ({
            value: employee.id,
            name: employee.employee_name
        })));

        const roleChoices = [];
        const sqlRoles = `
            SELECT id, title FROM role
        `;

        // query for the roles to choose from
        db.query(sqlRoles, (err, results) => {
            if (err) throw err;
            roleChoices.push(...results.map(role => ({
                value: role.id,
                name: role.title
            })));

            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Select the employee to update:',
                    choices: employeeChoices
                },
                {
                    name: 'newRole',
                    type: 'list',
                    message: 'Select the employee\'s new role:',
                    choices: roleChoices
                }
            ])
            .then(answers => {
                const { employee, newRole } = answers;
                const sqlUpdateRole = `
                    UPDATE employee SET role_id = ? WHERE id = ?
                `;

                // query to update the role of the employee
                db.query(sqlUpdateRole, [newRole, employee], (err, results) => {
                    if (err) throw err;
                    console.log('Employee role updated successfully.');
                    startApp();
                });
            });
        });
    });
};

// allows user to update the employee's manager within the database
// also allows user to select no manager (supervisor roles, future updates, etc.)
function updateEmployeeManager() {
    const employeeChoices = [];
    const sqlEmployees = `
        SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employee
    `;

    db.query(sqlEmployees, (err, results) => {
        if (err) throw err;
        employeeChoices.push(...results.map(employee => ({
            value: employee.id,
            name: employee.employee_name
        })));
        
        // allows user to select no manager
        // or to set as none for now and for updating later
        const managerChoices = [...employeeChoices];
        managerChoices.unshift({
            value: null,
            name: 'None'
        });

        inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                message: 'Select the employee to update:',
                choices: employeeChoices
            },
            {
                name: 'newManager',
                type: 'list',
                message: 'Select the employee\'s new manager:',
                choices: managerChoices
            }
        ])
        .then(answers => {
            const { employee, newManager } = answers;
            const sqlUpdateManager = `
                UPDATE employee SET manager_id = ? WHERE id = ?
            `;

            db.query(sqlUpdateManager, [newManager, employee], (err, results) => {
                if (err) throw err;
                console.log('Employee manager updated successfully.');
                startApp();
            });
        });
    });
};

// displays the employees by manager within the database
function viewEmployeesByManager() {
    const managerChoices = [];
    const sqlManagers = `
        SELECT
            id, CONCAT(first_name, ' ', last_name) AS manager_name
        FROM
            employee
        WHERE
            manager_id IS NULL
    `;

    // query assumes the managers within the database is any employee without a manager or manager_id set to NULL
    db.query(sqlManagers, (err, results) => {
        if (err) throw err;
        managerChoices.push(...results.map(manager => ({
            value: manager.id,
            name: manager.manager_name
        })));

        inquirer.prompt({
            name: 'manager',
            type: 'list',
            message: 'Select the manager to view employees:',
            choices: managerChoices
        })
        .then(answer => {
            const managerId = answer.manager;
            const sqlEmployeesByManager = `
                SELECT
                    employee.id AS employee_id,
                    CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name,
                    role.title,
                    department.name AS department,
                    role.salary
                FROM
                    employee
                INNER JOIN
                    role ON employee.role_id = role.id
                INNER JOIN
                    department ON role.department_id = department.id
                WHERE
                    employee.manager_id = ?
            `;

            // query to display the employees by manager within the database
            db.query(sqlEmployeesByManager, [managerId], (err, results) => {
                if (err) throw err;
                console.table(results);
                startApp();
            });
        });
    });
};

function viewEmployeesByDepartment() {
    const departmentChoices = [];
    const sqlDepartments = `
        SELECT id, name FROM department
    `;

    // query for departments to choose from
    db.query(sqlDepartments, (err, results) => {
        if (err) throw err;
        departmentChoices.push(...results.map(department => ({
            value: department.id,
            name: department.name
        })));

        inquirer.prompt({
            name: 'department',
            type: 'list',
            message: 'Select the department to view employees:',
            choices: departmentChoices
        })
        .then(answer => {
            const departmentId = answer.department;
            const sqlEmployeesByDepartment = `
                SELECT
                    employee.id AS employee_id,
                    CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name,
                    role.title,
                    department.name AS department,
                    role.salary
                FROM
                    employee
                INNER JOIN
                    role ON employee.role_id = role.id
                INNER JOIN
                    department ON role.department_id = department.id
                WHERE
                    department.id = ?
            `;

            // query to display the employees by department within the database
            db.query(sqlEmployeesByDepartment, [departmentId], (err, results) => {
                if (err) throw err;
                console.table(results);
                startApp();
            });
        });
    });
};

// delete department can only run if no roles are associated because this function already deletes both the department and the employees tied to it
// deleteRole should of deleted all associated employees so that deleteDepartment has no associated roles
// the idea comes from the schema to delete associated employees from roles >>> delete associated roles from departments >>> delete department
function deleteDepartment() {
    const departmentChoices = [];
    const sqlDepartments = `
        SELECT id, name FROM department
    `;

    // query for departments to choose from
    db.query(sqlDepartments, (err, results) => {
        if (err) throw err;
        departmentChoices.push(...results.map(department => ({
            value: department.id,
            name: department.name
        })));

        inquirer.prompt({
            name: 'department',
            type: 'list',
            message: 'Select the department to delete:',
            choices: departmentChoices
        })
        .then(answer => {
            const departmentId = answer.department;
            const sqlCheckRoles = `
                SELECT * FROM role WHERE department_id = ?
            `;

            // query to check that all roles associated with the department has been deleted first before deleting both the department and the employees tied to it
            db.query(sqlCheckRoles, [departmentId], (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    console.log('Cannot delete the department because it has associated roles.');
                    startApp();
                } else {
                    inquirer.prompt({
                        name: 'confirm',
                        type: 'confirm',
                        message: 'Are you sure you want to delete this department? This will also delete any associated employees.',
                        default: false
                    })
                    .then(confirmAnswer => {
                        if (confirmAnswer.confirm) {
                            const sqlDeleteDepartment = `
                                DELETE FROM department WHERE id = ?
                            `;

                            db.query(sqlDeleteDepartment, [departmentId], (err, result) => {
                                if (err) throw err;
                                console.log('Department deleted successfully.');
                                startApp();
                            });
                        } else {
                            console.log('Delete department canceled.');
                            startApp();
                        };
                    });
                };
            });
        });
    });
};

// just like deleteDepartment checks for roles deleteRole checks for associated employees before deleting
// the idea comes from the schema to delete associated employees from roles >>> delete associated roles from departments >>> delete department
function deleteRole() {
    const roleChoices = [];
    const sqlRoles = `
        SELECT id, title FROM role
    `;

    db.query(sqlRoles, (err, results) => {
        if (err) throw err;
        roleChoices.push(...results.map(role => ({
            value: role.id,
            name: role.title
        })));

        inquirer.prompt({
            name: 'role',
            type: 'list',
            message: 'Select the role to delete:',
            choices: roleChoices
        })
        .then(answer => {
            const roleId = answer.role;
            const sqlCheckEmployees = `
                SELECT * FROM employee WHERE role_id = ?
            `;

            db.query(sqlCheckEmployees, [roleId], (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    console.log('Cannot delete the role because it has associated employees.');
                    startApp();
                } else {
                    inquirer.prompt({
                        name: 'confirm',
                        type: 'confirm',
                        message: 'Are you sure you want to delete this role?',
                        default: false
                    })
                    .then(confirmAnswer => {
                        if (confirmAnswer.confirm) {
                            const sqlDeleteRole = `
                                DELETE FROM role WHERE id = ?
                            `;

                            db.query(sqlDeleteRole, [roleId], (err, result) => {
                                if (err) throw err;
                                console.log('Role deleted successfully.');
                                startApp();
                            });
                        } else {
                            console.log('Delete role canceled.');
                            startApp();
                        };
                    });
                };
            });
        });
    });
};


// delete employee would be the first action to take if wanting to delete a role or department
// the idea comes from the schema to delete associated employees from roles >>> delete associated roles from departments >>> delete department
function deleteEmployee() {
    const employeeChoices = [];
    const sqlEmployees = `
        SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employee
    `;

    // query for employees to choose from
    db.query(sqlEmployees, (err, results) => {
        if (err) throw err;
        employeeChoices.push(...results.map(employee => ({
            value: employee.id,
            name: employee.employee_name
        })));

        // first prompt to select the employee to delete
        inquirer.prompt({
            name: 'employee',
            type: 'list',
            message: 'Select the employee to delete:',
            choices: employeeChoices
        })
        .then(answer => {
            const employeeId = answer.employee;

            // second prompt to confirm the deletion of the employee
            inquirer.prompt({
                name: 'confirm',
                type: 'confirm',
                message: 'Are you sure you want to delete this employee?',
                default: false
            })
            .then(confirmAnswer => {
                if (confirmAnswer.confirm) {
                    const sqlDeleteEmployee = `
                        DELETE FROM employee WHERE id = ?
                    `;

                    // query to delete employees from database
                    db.query(sqlDeleteEmployee, [employeeId], (err, result) => {
                        if (err) throw err;
                        console.log('Employee deleted successfully.');
                        startApp();
                    });
                } else {
                    console.log('Delete employee canceled.');
                    startApp();
                };
            });
        });
    });
};

function viewDepartmentBudget() {
    const departmentChoices = [];
    const sqlDepartments = `
        SELECT id, name FROM department
    `;

    db.query(sqlDepartments, (err, results) => {
        if (err) throw err;
        departmentChoices.push(...results.map(department => ({
            value: department.id,
            name: department.name
        })));

        inquirer.prompt({
            name: 'department',
            type: 'list',
            message: 'Select the department to view total budget of all associated employees:',
            choices: departmentChoices
        })
        .then(answer => {
            const departmentId = answer.department;
            const sqlTotalBudget = `
                SELECT
                    SUM(role.salary) AS total_budget
                FROM
                    employee
                INNER JOIN
                    role ON employee.role_id = role.id
                WHERE
                    role.department_id = ?
            `;

            // query to view total budget >>> the default (totalBudget) is set to 0 in case no employees, salaries of 0, etc.
            db.query(sqlTotalBudget, [departmentId], (err, results) => {
                if (err) throw err;
                const totalBudget = results[0].total_budget || 0;

                console.log(`Total budget for the department: $${totalBudget}`);
                startApp();
            })
        })
    })
}

// allows user to exit the application at any time
function exitApp() {
    console.log('Exiting application...');
    db.end(err => {
        if (err) throw err;
        console.log('Connection closed.');
        process.exit(0);
    });
};