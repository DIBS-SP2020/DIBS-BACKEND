CREATE DATABASE IF NOT EXISTS dibs;

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
    email VARCHAR(128),
    salt VARCHAR(128) NOT NULL,
    passhash VARCHAR(128) NOT NULL,
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
    verified BOOLEAN,
    points INTEGER,
    admin BOOLEAN,
    PRIMARY KEY (user_uuid),
    FOREIGN KEY (user_uuid)
        REFERENCES user(uuid)
        ON DELETE CASCADE,
    FOREIGN KEY (group_uuid)
        REFERENCES groups(uuid)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prizes (
    id VARCHAR(128),
    group_uuid VARCHAR(128),
    name TEXT,
    points INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (group_uuid)
        REFERENCES groups(uuid)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    uid VARCHAR(128),
    group_uuid VARCHAR(128),
    assigned_user VARCHAR(128),
    dibbed BOOLEAN,
    sell_value INTEGER,
    complete_date DATETIME,
    icon_id INT,
    point_value INTEGER,
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

CREATE TABLE IF NOT EXISTS barter (
    group_uuid VARCHAR(128),
    user1_uuid VARCHAR(128),
    user2_uuid VARCHAR(128),
    task_id VARCHAR(128),
    points INTEGER,
    PRIMARY KEY (user1_uuid, user2_uuid, task_id),
    FOREIGN KEY (group_uuid)
        REFERENCES groups(uuid)
        ON DELETE CASCADE
    FOREIGN KEY (task_id)
        REFERENCES tasks(uid)
        ON DELETE CASCADE
    FOREIGN KEY (user1_uuid)
        REFERENCES user(uuid),
    FOREIGN KEY (user2_uuid)
        REFERENCES user(uuid),
);

CREATE TABLE IF NOT EXISTS user_session (
    apiKey VARCHAR(64),
    user_uuid VARCHAR(128),
    PRIMARY KEY (apiKey),
    FOREIGN KEY (user_uuid)
        REFERENCES user(uuid)
        ON DELETE CASCADE
)