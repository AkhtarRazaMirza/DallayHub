CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(45) NOT NULL,
	"last_name" varchar(45),
	"email" varchar(322) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"password" varchar(66) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
