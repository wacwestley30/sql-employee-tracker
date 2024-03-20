INSERT INTO department (name)
VALUES ('Engineering'),
       ('Finance'),
       ('Legal'),
       ('Marketing'),
       ('Sales');

INSERT INTO role (title, salary, department_id)
VALUES ('Project Manager', 180000, 1),
       ('Software Developer', 80000, 2),
       ('Account Manager', 160000, 3),
       ('Accountant', 75000, 4),
       ('Legal Team Lead', 200000, 5),
       ('Lawyer', 150000, 6),
       ('Sales Manager', 100000, 7);
       ('Marketing Coordinator', 60000, 8),

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Jane', 'Smith', 2, 1),
       ('Mike', 'Johnson', 3, NULL),
       ('Sarah', 'Allen', 4, 2),
       ('Ashley', 'Rodriguez', 5, NULL),
       ('Kevin', 'Brown', 6, 3),
       ('Kayla', 'Mason', 7, NULL),
       ('Destiny', 'Frost', 8, 4);
