USE dibs;

CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(128),
    url TEXT,
    last_updated DATETIME,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS user (
    uuid VARCHAR(128),
    first VARCHAR(50) NOT NULL,
    last VARCHAR(50),
    salt VARCHAR(8) NOT NULL,
    passhash BINARY(60) NOT NULL,
    profile_image_id VARCHAR(128),
    PRIMARY KEY (uuid),
    FOREIGN KEY (profile_image_id)
        REFERENCES images(id)
);

CREATE TABLE IF NOT EXISTS groups (
    uuid VARCHAR(128),
    name VARCHAR(128),
    profile_image_id VARCHAR(128),
    PRIMARY KEY (uuid),
    FOREIGN KEY (profile_image_id)
        REFERENCES images(id)
);

CREATE TABLE IF NOT EXISTS in_group (
    user_uuid VARCHAR(128),
    group_uuid VARCHAR(128),
    admin BOOLEAN,
    PRIMARY KEY (user_uuid),
    FOREIGN KEY (user_uuid)
        REFERENCES user(uuid)
        ON DELETE CASCADE,
    FOREIGN KEY (group_uuid)
        REFERENCES groups(uuid)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    uid VARCHAR(128),
    group_uuid VARCHAR(128),
    assigned_user VARCHAR(128),
    dibbed BOOLEAN,
    complete_date DATETIME,
    icon_id INT,
    point_value INT,
    description TEXT,
    PRIMARY KEY (uid),
    FOREIGN KEY (assigned_user)
        REFERENCES user(uuid),
    FOREIGN KEY (group_uuid)
        REFERENCES groups(uuid)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recurring_tasks (
    uid VARCHAR(128),
    group_uuid VARCHAR(128),
    frequency INT,
    icon_id INT,
    point_value INT,
    description TEXT,
    PRIMARY KEY (uid),
    FOREIGN KEY (group_uuid)
        REFERENCES groups(uuid)
        ON DELETE CASCADE
);