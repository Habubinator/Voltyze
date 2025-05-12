-- Нижче вказаний код для запуску і налаштування бд, його потрібно виконати як query при першому запуску бази данних 
-- drop database car_charger_map_db;
CREATE DATABASE car_charger_map_db;

USE car_charger_map_db;

-- (Костиль) БД вірна, перевірки існують всередині коду, але вони можуть виконатись паралельно, тому це забеспечує щоб не викидувались помилки на пустому місці
SET
    foreign_key_checks = 0;

-- Використовую BIGINT і UNIX час, для того, щоб зменшити подальше створення багатьох об'єктів Date всередині NodeJs коду
CREATE TABLE
    api_source (
        api_id SMALLINT AUTO_INCREMENT PRIMARY KEY,
        link VARCHAR(512) UNIQUE NOT NULL,
        detailed_link VARCHAR(512) NOT NULL,
        last_update BIGINT,
        next_update BIGINT,
        update_interval_ms BIGINT
    );

ALTER TABLE api_source
ADD COLUMN comments_link VARCHAR(255);

CREATE TABLE
    station_marker (
        station_id INT AUTO_INCREMENT PRIMARY KEY,
        longitude Decimal(9, 6) NOT NULL,
        latitude Decimal(9, 6) NOT NULL
    );

CREATE TABLE
    station_description (
        description_id INT AUTO_INCREMENT PRIMARY KEY,
        station_id INT,
        station_name VARCHAR(255),
        description_string VARCHAR(600),
        location_type VARCHAR(255),
        country_code CHAR(10),
        support_phone VARCHAR(255),
        is_support_charging BOOLEAN,
        is_support_reservation BOOLEAN,
        location_name VARCHAR(255),
        last_charging BIGINT,
        is_public BOOLEAN,
        is_fast_charger BOOLEAN,
        is_open_24x7 BOOLEAN,
        min_power_kw SMALLINT,
        max_power_kw SMALLINT,
        last_status_update BIGINT,
        network_id TINYINT,
        status_id TINYINT,
        station_flags BIT (16),
        FOREIGN KEY (station_id) REFERENCES station_marker (station_id)
    );

CREATE TABLE
    station_connector (
        connector_id INT AUTO_INCREMENT PRIMARY KEY,
        description_id INT,
        connector_type_id TINYINT,
        connector_status_id TINYINT,
        connector_name VARCHAR(255),
        power_kw SMALLINT,
        current_amp SMALLINT,
        price_per_start DEC(10, 2),
        price DEC(10, 2),
        currency CHAR(4),
        free_min_after_charging SMALLINT,
        price_per_min_after_charging DEC(10, 2),
        FOREIGN KEY (description_id) REFERENCES station_description (description_id)
    );

-- Використовую plural form в словах comments та images, бо ці слова є ключовими у синтаксисі MySQL 
CREATE TABLE
    comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        description_id INT,
        comment_href VARCHAR(255),
        author_name VARCHAR(255),
        rating FLOAT,
        comment_text VARCHAR(600),
        FOREIGN KEY (description_id) REFERENCES station_description (description_id)
    );

CREATE TABLE
    images (
        image_id INT AUTO_INCREMENT PRIMARY KEY,
        description_id INT,
        image_href VARCHAR(255),
        FOREIGN KEY (description_id) REFERENCES station_description (description_id)
    );

CREATE TABLE
    station_desc_api (
        id INT AUTO_INCREMENT PRIMARY KEY,
        api_id SMALLINT,
        og_api_pk INT,
        description_id INT,
        FOREIGN KEY (api_id) REFERENCES api_source (api_id),
        FOREIGN KEY (description_id) REFERENCES station_description (description_id)
    );

-- API1
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms,
        comments_link
    )
VALUES
    (
        'ws://91.200.2.37/api1-ws',
        'http://91.200.2.37/api1/v3.1/get_location/{id}?language=uk&timeZone=GMT%2B0200/',
        0,
        0,
        86400000,
        'http://91.200.2.37/api1/v2.2/get_comments/{id}?limit=10&offset=0&show_ratings=true'
    );

-- API2
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api2/chargers-all',
        'http://91.200.2.37/api2/v1/stations/{id}',
        0,
        0,
        86400000
    );

-- API3
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api3/v2/app/locations',
        'null',
        0,
        0,
        86400000
    );

-- API4
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api4/chargers-all',
        'null',
        0,
        0,
        86400000
    );

-- API7
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api7/chargers-all',
        'http://91.200.2.37/api7/charge-box-by-pk/{id}',
        0,
        0,
        86400000
    );

-- API8
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api8/chargers-all',
        'http://91.200.2.37/api8/stations/{id}?l=uk',
        0,
        0,
        86400000
    );

-- API9
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api9/chargers-all',
        'http://91.200.2.37/api9/charger/{id}',
        0,
        0,
        86400000
    );

-- API11
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api11/chargers-all?latitude=48.7697&longitude=16.95621&spanLat=12.939622&spanLng=10.117456',
        'http://91.200.2.37/api11/location/{id}',
        0,
        0,
        86400000
    );

-- API12
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api12/chargers-all',
        '',
        0,
        0,
        86400000
    );

-- API12
INSERT INTO
    api_source (
        link,
        detailed_link,
        last_update,
        next_update,
        update_interval_ms
    )
VALUES
    (
        'http://91.200.2.37/api26/chargers-all',
        'http://91.200.2.37/api26/charger/{id}',
        0,
        0,
        86400000
    );