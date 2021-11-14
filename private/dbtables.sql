create table if not exists accounts(
    id int unsigned primary key auto_increment,
    profile_photo varchar(255) not null default 'default.png',
    username varchar(255) not null,
    email varchar(255) not null,
    mobile int not null,
    password varchar(255) not null,
    vkey varchar(255) not null,
    access_key varchar(255) not null,
    otp int not null default 0,
    user_type varchar(255) not null default 'student',
    institution varchar(255) not null,
    work_experience json not null default '{years : 0}',
    priority varchar(255) not null default 'normal',
    descrition varchar(255),
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    created_datetime datetime not null default CURRENT_TIMESTAMP
);

create table if not exists posts(
    id int unsigned primary key auto_increment,
    user_id int unsigned,
    title varchar(255),
    tags json,
    description text,
    status varchar(255) not null default 'open',
    answers int unsigned not null default 0, 
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    created_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists post_answers(
    id int unsigned primary key auto_increment,
    post_id int unsigned,
    user_id int unsigned,
    description text,
    upvotes int default 0,
    shares int unsigned default 0,
    likes int unsigned default 0,
    unlinke int unsigned default 0, 
    foreign key (user_id) references accounts(id),
    foreign key (post_id) references posts(id)
);

create table if not exists tags_posts(
    id int unsigned primary key auto_increment,
    tag_name varchar(255) not null,
    related_posts json not null,
    posts_count int not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP
);

create table if not exists contribution_users(
    id int unsigned primary key auto_increment,
    user_id int unsigned,   
    posts_count int not null default 0,
    comments_count int not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id)
);

create table if not exists comments(
    id int unsigned primary key auto_increment,
    user_id int unsigned,   
    parent_comment int unsigned default 0,
    description text not null,
    shares int unsigned default 0,
    likes int unsigned default 0,
    unlinke int unsigned default 0, 
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (user_id) references accounts(id),
    foreign key (parent_comment) references comments(id)
);

create table if not exists payment_logs(
    id int unsigned primary key auto_increment,
    payer_id int unsigned,   
    reciever_id int unsigned,   
    payment_id varchar(255) not null,
    currency varchar(255) not null,
    amount int not null,
    status varchar(255) not null,
    order_id varchar(255) not null,
    description varchar(255) not null,
    vpa varchar(255) not null,
    email varchar(255) not null,
    contact varchar(255) not null,
    notes varchar(255),
    fee int unsigned not null,
    tax int unsigned not null,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (payer_id) references accounts(id),
    foreign key (reciever_id) references accounts(id)
);

create table if not exists roadmaps(
    id int unsigned primary key auto_increment,
    field_name varchar(255) not null,
    linked_fields json not null,
    priority int unsigned not null,
    clicks int unsigned not null default 0,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP
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
    unlinke int unsigned default 0, 
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

create table if not exists roadmaps_popularity_location(
    id int unsigned primary key auto_increment,
    field_id int unsigned,
    latitude varchar(255) not null,
    longitude varchar(255) not null,
    clicks varchar(255) not null default 1,
    updated_datetime datetime not null default CURRENT_TIMESTAMP,
    create_datetime datetime not null default CURRENT_TIMESTAMP,
    foreign key (field_id) references roadmaps(id)
);