# SQL-Employee-Tracker

[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Description

This project uses Inquirer, MySQL2, MySQL databases and Node.js to run this app entirely within the Command-Line Interface (CLI). This app can be used to track employees through a mySQL database. Each employee can be assigned a department, role, salary, manager, etc. This app assumes any employee without a manager is a manager. This app can also delete and update any department, role or employee. Also, a total budget for each department can be viewed at any time.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Questions](#questions)

## Installation

Start by running `npm i` to install any dependencies such as inquirer and mysql2.

## Usage

After installing, please run your MySQL server and add at least the `schema.sql` to your local list of databases. Generally running `mysql -u root -p` will start the process for running MySQL with `-u` flag being for username and `-p` flag being for password. Once connected to MySQL, running `source db/schema.sql` will add the formatted tables department, role and employee. There is a provided `seeds.sql` for examples or testing. Running `source db/seeds.sql` will populate the tables with the seeds. Finally, run `\q` to quit MySQL.

After populating with either your own seeds or the provided seeds, please run `node server.js` to start the CLI application. Once the program has started, you are presented with a list of questions to access and manage the new database.

### View
Starting from the top, you can 'View all departments', 'View all roles' and 'View all employees'. These 3 options will return tables in the CLI for review. Each table is in order by their respective ID.


### Delete
Next, you can try to 'Delete department' or 'Delete role' but any associated employees to either will keep you from deleting an already populated department or role. This is based on the schema.sql with the idea of first deleting the employee to delete the role so you can delete the department. Selecting 'Delete employee' will start the process. From here, you can select the employee by name that you want to delete. When all employees within a role are deleted, you can select 'Delete role' to delete the role. Finally when all roles associated with a department are deleted, you can select 'Delete department' to delete the entire department.

### Add
Next, going by the schema.sql in order you can select 'Add a department' that will add a department to the database. Then, select 'Add a role' to add a new role to an existing department. Finally, selecting 'Add an employee' will add a new employee to an existing role where they will be given a role and manager. Selecting `None` when choosing a manager will assume this new employee is a manager.

### Update
Alternatively, any employee can have their role or manager updated. Selecting 'Update an employee role' will change the selected employee's role and salary. Selecting 'Update employee manager' will change the selecteed employee's manager based on the managers within the database. Selecting `None` when updating the manager will assume that this employee is a manager.

### Filtering
Next, 'View employees by manager' and 'View employees by department' returns tables that are filtered by just the manager or by the department the employees are in.

### Budget
Finally, 'View department budget' will sum the total of all employees within a  selected department and return the total budget within the CLI.

https://drive.google.com/file/d/1T04IFXAtIutWaJ2i2OzNf2M2nwFXmbPj/view?usp=drive_link

## License

Licensed under the MIT license.

[MIT License](https://opensource.org/licenses/MIT)

## Questions

For any questions, please contact WestleyCervantes@gmail.com. Visit [wacwestley30](https://github.com/wacwestley30) for more projects.
