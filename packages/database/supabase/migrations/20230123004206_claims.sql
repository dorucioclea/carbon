CREATE OR REPLACE FUNCTION is_claims_admin() RETURNS "bool"
  LANGUAGE "plpgsql" 
  AS $$
  BEGIN
    IF session_user = 'authenticator' THEN
      --------------------------------------------
      -- To disallow any authenticated app users
      -- from editing claims, delete the following
      -- block of code and replace it with:
      -- RETURN FALSE;
      --------------------------------------------
      IF extract(epoch from now()) > coalesce((current_setting('request.jwt.claims', true)::jsonb)->>'exp', '0')::numeric THEN
        return false; -- jwt expired
      END IF; 
      
      IF EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text((current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'->'users_update') AS j
          WHERE j::int = 0
      ) THEN
        return true; -- user has user_update set to true
      ELSE
        return false; -- user does NOT have user_update set to true
      END IF;
      --------------------------------------------
      -- End of block 
      --------------------------------------------
    ELSE -- not a user session, probably being called from a trigger or something
      return true;
    END IF;
  END;
$$;

CREATE OR REPLACE FUNCTION get_my_claims() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE retval jsonb;
    BEGIN
      select raw_app_meta_data from auth.users into retval where id = auth.uid();
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION get_my_claim(claim text) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE retval jsonb;
    BEGIN
      select coalesce(raw_app_meta_data->claim, null) from auth.users into retval where id = auth.uid();
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION has_company_permission(claim text, company integer) RETURNS "bool"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
     IF EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text((current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'->claim) AS j
          WHERE j::int = 0
      ) THEN
        return true;
      ELSIF EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text((current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'->claim) AS j
          WHERE j::int = company
      ) THEN
        return true;
      ELSE
        return false; 
      END IF;
    END;
$$;

CREATE OR REPLACE FUNCTION get_claims(uid uuid) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE retval jsonb;
    BEGIN
      select raw_app_meta_data from auth.users into retval where id = uid::uuid;
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION get_claim(uid uuid, claim text) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE retval jsonb;
    BEGIN
      select coalesce(raw_app_meta_data->claim, null) from auth.users into retval where id = uid::uuid;
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION set_claim(uid uuid, claim text, value jsonb) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      IF NOT is_claims_admin() THEN
          RETURN 'error: access denied';
      ELSE        
        update auth.users set raw_app_meta_data = 
          raw_app_meta_data || 
            json_build_object(claim, value)::jsonb where id = uid;
        return 'OK';
      END IF;
    END;
$$;

CREATE OR REPLACE FUNCTION delete_claim(uid uuid, claim text) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      IF NOT is_claims_admin() THEN
          RETURN 'error: access denied';
      ELSE        
        update auth.users set raw_app_meta_data = 
          raw_app_meta_data - claim where id = uid;
        return 'OK';
      END IF;
    END;
$$;
NOTIFY pgrst, 'reload schema';