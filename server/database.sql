create database Todo;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE oauthUser (
    node_id TEXT PRIMARY KEY NOT NULL,
    user_name VARCHAR(30) NOT NULL
);

CREATE TABLE todo (
    user_id UUID NOT NULL,
    tid SERIAL PRIMARY KEY NOT NULL,
    description TEXT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE oauthTodo (
    node_id TEXT NOT NULL,
    tid SERIAL PRIMARY KEY NOT NULL,
    description TEXT NOT NULL UNIQUE,
    FOREIGN KEY (node_id) REFERENCES oauthUser(node_id)
);

CREATE TABLE chats (
    chat_id UUID PRIMARY KEY REFERENCES chatList(chat_id) ON DELETE CASCADE,  
    users TEXT[],                      
    created_at TIMESTAMP DEFAULT NOW(),   
    messages TEXT[],                      
    last_message TEXT,                    
    seen_by TEXT[]                     
);

CREATE TABLE message (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
    chat_id UUID REFERENCES chats(chat_id) ON DELETE CASCADE,  
    user_id UUID,                                    
    message TEXT,                                    
    created_at TIMESTAMP DEFAULT NOW()               
);

CREATE TABLE chatList (
    user_name VARCHAR(30) NOT NULL,
    chat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    owner_id TEXT,
    owner_name TEXT 
);

ALTER TABLE todo
ADD COLUMN due DATE NOT NULL;

ALTER TABLE users
ADD COLUMN chat_ids UUID[];

ALTER TABLE oauthTodo
ADD COLUMN due DATE NOT NULL;

ALTER TABLE todo
DROP CONSTRAINT description;

ALTER TABLE chatList
ADD COLUMN owner_id TEXT;

ALTER TABLE chatList
ADD COLUMN owner_name TEXT;


INSERT INTO oauthTodo (description,node_id,due) VALUES ("Clean","MDQ6VXNlcjkxMDgxMzc4","2024-06-27");


CREATE OR REPLACE FUNCTION update_messages_array()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats
    SET messages = array_append(messages, NEW.message),
        last_message = NEW.message
    WHERE chat_id = NEW.chat_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_message_insert
AFTER INSERT ON message
FOR EACH ROW
EXECUTE FUNCTION update_messages_array();

INSERT INTO message (chat_id, user_id, message)
VALUES ('f8275b9c-c98d-4b99-ac51-3380700bb452', '97b541f6-3ee5-42a4-83d0-d3c35660c6da', 'Hello!!!!');

SELECT * FROM chatList where owner_id = '97b541f6-3ee5-42a4-83d0-d3c35660c6da' OR user_id = '97b541f6-3ee5-42a4-83d0-d3c35660c6da';