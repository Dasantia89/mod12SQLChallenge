INSERT INTO departments (name)
VALUES  ("Human Resources"),
        ("Electronics"),
        ("General Merchandising"),
        ("Front end"),
        ("Style");

INSERT INTO roles (title,salary,department_id)
VALUES  ("HR Team Lead", 130000,1),
        ("Electronics Team Lead", 150000,2),
        ("Electronics Team Member", 30000,2),
        ("General Merchandising Team Lead", 125000,3),
        ("Merchandiser", 25000,3),
        ("Front end Team Lead", 175000,4),
        ("Cashier", 25000,4),
        ("Guest Service", 35000, 4),
        ("Style Team Lead", 100000, 5),
        ("Folder", 25000,5),
        ("Hanger", 25000, 5);

INSERT INTO employees (first_name,last_name,role_id,manager_id)
VALUES  ("Isabella", "Rodriguez", 1,NULL),
        ("Liam","Thompson", 2,NULL),
        ("Mia","Foster", 3,2),
        ("Ethan","Harper", 4,NULL),
        ("Olivia","Chen", 5,4),
        ("Noah","Armstrong", 6,NULL),
        ("Ava","Patel", 7,6),
        ("Lucas","Malone", 8, 6),
        ("Sophia","Kim", 9, NULL),
        ("Jackson","Sullivan", 10,9),
        ("Emma","Reynolds", 11, 9);



