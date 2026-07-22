CREATE TABLE "waitlist_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"business_name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"whatsapp_number" text,
	"city" text,
	"monthly_order_volume" text,
	"tools_used" text,
	"brands_carried" text,
	"net30_interest" boolean,
	"message" text,
	"lang" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
