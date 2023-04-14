

CREATE TABLE "employees" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL
);

CREATE TABLE "rooms" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL,
  "opening_hours" int NOT NULL, -- as minutes from midnight
  "closing_hours" int NOT NULL  -- as minutes from midnight
);

CREATE TABLE "bookings" (
  "id" SERIAL PRIMARY KEY,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp NOT NULL,
  "employee_id" int,
  "room_id" int,
  "cancelled" boolean
);

ALTER TABLE "bookings" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("room_id") REFERENCES "rooms" ("id");
