CREATE TABLE IF NOT EXISTS label_hashes(
    label           VARCHAR(255),
    hash            VARCHAR(255),
    UNIQUE (label, hash)
);
