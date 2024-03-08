ALTER TABLE "webhooks" RENAME COLUMN "endpointeger" TO "endpoint";--> statement-breakpoint
ALTER TABLE "webhook_events" ADD COLUMN "status" text DEFAULT 'attempting';