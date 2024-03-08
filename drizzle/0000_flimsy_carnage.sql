CREATE TABLE IF NOT EXISTS "accounts" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"access_token" varchar(255),
	"expires_at" integer,
	"refresh_token_expires_in" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" varchar(255),
	"session_state" varchar(255),
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"text" varchar(512) NOT NULL,
	"url" varchar(256) NOT NULL,
	"ua" varchar(256) NOT NULL,
	"userId" varchar(12)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fields" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"type" text NOT NULL,
	"label" varchar(256) NOT NULL,
	"placeholder" varchar(256),
	"required" boolean DEFAULT false NOT NULL,
	"description" varchar(512),
	"order" integer,
	"options" varchar(512),
	"form_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forms" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"title" varchar(256) NOT NULL,
	"description" varchar(512),
	"submit_text" varchar(256) NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"user_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submissions" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"form_id" text NOT NULL,
	"data" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_events" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"webhook_id" text NOT NULL,
	"submission_id" text NOT NULL,
	"event" varchar(256) NOT NULL,
	"status_code" integer,
	"last_attempt" timestamp,
	"next_attempt" timestamp,
	"attempt_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhooks" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"form_id" text NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"endpointeger" text NOT NULL,
	"events" json,
	"enabled" boolean DEFAULT true NOT NULL,
	"secret_key" varchar(256) NOT NULL
);
