create table if not exists accounts(
    id int unsigned primary key auto_increment,
    profile_photo varchar(255) not null default "default.png",
    username varchar(255) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    vkey varchar(255) not null,
    access_key varchar(255) not null,
    otp varchar(255) not null default 00000,
    user_type varchar(255) not null default 'student',
    user_choice_type varchar(255) not null default 'student',
    priority varchar(255) not null default 'normal',
    description varchar(255),
    verified int not null default 0, 
    otp_expiry datetime not null default CURRENT_TIMESTAMP,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    created_datetime datetime not null default CURRENT_TIMESTAMP
);

create table if not exists threads(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    title varchar(255) not null,
    description text not null,
    status varchar(255) not null default 'open',
    posts_count int not null default 0,    
    likes int unsigned not null default 0,
    dislikes int unsigned not null default 0,
    shares int unsigned not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists threads_likes(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    thread_id int unsigned,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (thread_id) references threads(id)
);

create table if not exists threads_dislikes(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    thread_id int unsigned,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (thread_id) references threads(id)
);

create table if not exists posts(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    thread_id int unsigned,
    thread_answer int not null default 0,
    tags text not null default "",
    description text not null,
    views int unsigned not null default 0,
    likes int unsigned not null default 0,
    dislikes int unsigned not null default 0,
    shares int unsigned not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (thread_id) references threads(id)
);

create table if not exists posts_likes(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    post_id int unsigned,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (post_id) references posts(id)
);
create table if not exists posts_dislikes(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    post_id int unsigned,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (post_id) references posts(id)
);

create table if not exists posts_comments(
    id int unsigned primary key auto_increment,
    user_id int unsigned,   
    post_id int unsigned,
    parent_comment int unsigned default 0,
    description text not null,
    shares int unsigned default 0,
    likes int unsigned default 0,
    dislikes int unsigned default 0, 
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (post_id) references posts(id),
    foreign key (parent_comment) references posts_comments(id)
);

create table if not exists posts_comments_likes(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    posts_comment_id int unsigned,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (posts_comment_id) references posts_comments(id)
);
create table if not exists posts_comments_dislikes(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    posts_comment_id int unsigned,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (posts_comment_id) references posts_comments(id)
);


create table if not exists users_contribution(
    id int unsigned primary key auto_increment,
    user_id int unsigned,   
    posts_count int not null default 0,
    comments_count int not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists fields_departments(
    id int unsigned primary key auto_increment,
    department_name varchar(255) not null,
    clicks int unsigned not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP
);

create table if not exists designation(
    id int unsigned primary key auto_increment,
    department_id int unsigned,
    designation_name varchar(255) not null,
    roadmap text not null,
    priority int unsigned not null,
    clicks int unsigned not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (department_id) references fields_departments(id)
);

create table if not exists designation_popularity_location(
    id int unsigned primary key auto_increment,
    designation_id int unsigned,
    latitude varchar(255) not null,
    longitude varchar(255) not null,
    clicks varchar(255) not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (designation_id) references designation(id)
);

create table if not exists mentor_quality(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    rating int unsigned not null default 0,
    videos_count int unsigned not null default 0,
    sessions_count int unsigned not null default 0,
    content_count int unsigned not null default 0,
    reviews_count int unsigned not null default 0,
    live_session_rate int unsigned not null default 200,
    membership_plan varchar(255) default 'free', 
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists mentor_content(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    price varchar(255) not null default 'free',
    rating int unsigned not null default 0,
    title varchar(255) not null,
    tags json not null,
    content text not null,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists mentor_content_reviews(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    parent_comment int unsigned default 0,
    description text not null,
    shares int unsigned default 0,
    likes int unsigned default 0,
    dislikes int unsigned default 0, 
    status varchar(255) not null default 'under review',
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (parent_comment) references mentor_content_reviews(id)
);

create table if not exists user_history(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    action varchar(255) not null,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists notification_history(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    content varchar(255) not null,
    type int not null,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists email_history(
    id int unsigned primary key auto_increment,
    email_to varchar(255) not null,
    email_from varchar(255) not null,
    subject varchar(255) not null,
    content text not null,
    content_type varchar(255) not null,
    status varchar(255) not null default 'delivered',
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP
);
