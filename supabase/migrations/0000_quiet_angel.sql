CREATE TYPE "public"."tenant_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_users" (
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "tenant_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_users_tenant_id_user_id_pk" PRIMARY KEY("tenant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "users_select_own" ON users
FOR SELECT USING (id = auth.uid());
--> statement-breakpoint
CREATE POLICY "users_insert_self" ON users
FOR INSERT WITH CHECK (id = auth.uid());
--> statement-breakpoint
CREATE POLICY "users_update_self" ON users
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());
--> statement-breakpoint
CREATE POLICY "tenants_select_member" ON tenants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tenant_users
    WHERE tenant_users.tenant_id = tenants.id
      AND tenant_users.user_id = auth.uid()
  )
);
--> statement-breakpoint
CREATE POLICY "tenants_insert_authenticated" ON tenants
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY "tenant_users_select_self" ON tenant_users
FOR SELECT USING (user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "tenant_users_insert_owner" ON tenant_users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = tenant_users.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role = 'owner'
  )
);
--> statement-breakpoint
CREATE POLICY "tenant_users_update_owner" ON tenant_users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = tenant_users.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role = 'owner'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = tenant_users.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role = 'owner'
  )
);
--> statement-breakpoint
CREATE POLICY "tenant_users_delete_owner" ON tenant_users
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = tenant_users.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role = 'owner'
  )
);
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id uuid;
  tenant_name text;
BEGIN
  tenant_name := split_part(NEW.email, '@', 1) || '''s Workspace';

  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.tenants (name, created_at)
  VALUES (tenant_name, NOW())
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.tenant_users (tenant_id, user_id, role, created_at)
  VALUES (new_tenant_id, NEW.id, 'owner', NOW());

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user() failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
--> statement-breakpoint
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();