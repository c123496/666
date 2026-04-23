CREATE TABLE "game_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"scenario" varchar(100) NOT NULL,
	"final_score" integer NOT NULL,
	"result" varchar(20) NOT NULL,
	"played_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_records" ADD CONSTRAINT "game_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_records_user_id_idx" ON "game_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_records_scenario_idx" ON "game_records" USING btree ("scenario");--> statement-breakpoint
CREATE INDEX "game_records_result_idx" ON "game_records" USING btree ("result");--> statement-breakpoint
CREATE INDEX "game_records_played_at_idx" ON "game_records" USING btree ("played_at");--> statement-breakpoint
CREATE INDEX "generated_images_user_id_idx" ON "generated_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generated_images_created_at_idx" ON "generated_images" USING btree ("created_at");