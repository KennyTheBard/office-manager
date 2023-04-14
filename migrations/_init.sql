
CREATE TABLE "employees" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE "rooms" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL,
  "opening_hours" int NOT NULL,
  -- as minutes from midnight
  "closing_hours" int NOT NULL,
  -- as minutes from midnight
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE "bookings" (
  "id" SERIAL PRIMARY KEY,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp NOT NULL,
  "employee_id" int,
  "room_id" int,
  "cancelled" boolean,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

ALTER TABLE "bookings"
ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id");

ALTER TABLE "bookings"
ADD FOREIGN KEY ("room_id") REFERENCES "rooms" ("id");
