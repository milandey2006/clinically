CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"age" integer,
	"gender" varchar(20),
	"contact" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" varchar(255) NOT NULL,
	"patient_id" integer NOT NULL,
	"diagnosis" text,
	"medicines" text,
	"advice" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
