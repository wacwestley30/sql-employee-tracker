INSERT INTO department (name)
VALUES ('Engineering'),
       ('Finance'),
       ('Legal'),
       ('Marketing'),
       ('Sales');

INSERT INTO role (title, salary, department_id)
VALUES ('Project Manager', 180000, 1),
       ('Software Developer', 80000, 1),
       ('Account Manager', 160000, 2),
       ('Accountant', 75000, 2),
       ('Legal Team Lead', 200000, 3),
       ('Lawyer', 150000, 3),
       ('Marketing Manager', 100000, 4),
       ('Sales Associate', 60000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Jane', 'Smith', 2, 1),
       ('Mike', 'Johnson', 3, NULL),
       ('Sarah', 'Allen', 4, 3),
       ('Ashley', 'Rodriguez', 5, NULL),
       ('Kevin', 'Brown', 6, 5),
       ('Kayla', 'Mason', 7, NULL),
       ('Destiny', 'Frost', 8, 7);
