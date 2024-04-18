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
      -- TODO: we should be able to use (current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'
      select raw_app_meta_data from auth.users into retval where id = auth.uid();
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION get_my_claim(claim text) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE retval jsonb;
    BEGIN
      -- TODO: we should be able to use (current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'
      select coalesce(raw_app_meta_data->claim, null) from auth.users into retval where id = auth.uid();
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION jsonb_to_integer_array(jsonb) RETURNS integer[]
    LANGUAGE "sql" IMMUTABLE
    AS $$
    SELECT array_agg(value::int) FROM jsonb_array_elements_text($1) AS t(value);
$$;

CREATE OR REPLACE FUNCTION jsonb_to_text_array(jsonb) RETURNS text[]
    LANGUAGE "sql" IMMUTABLE
    AS $$
    SELECT array_agg(value::text) FROM jsonb_array_elements_text($1) AS t(value);
$$;

CREATE OR REPLACE FUNCTION get_permission_companies(claim text) RETURNS integer[]
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE retval integer[];
    BEGIN
      -- TODO: (current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'->
      select jsonb_to_integer_array(coalesce(raw_app_meta_data->claim, '[]')) from auth.users into retval where id = auth.uid();
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION get_permission_companies_as_text(claim text) RETURNS text[]
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE retval text[];
    BEGIN
      -- TODO: (current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'->
      select jsonb_to_text_array(coalesce(raw_app_meta_data->claim, '[]')) from auth.users into retval where id = auth.uid();
        return retval;
      
    END;
$$;

CREATE OR REPLACE FUNCTION has_role(role text) RETURNS "bool"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      IF (get_my_claim('role'::text)) = ('"' || role || '"'::text)::jsonb THEN
        return true;
      ELSE
        return false;
      END IF;
    END;
$$;

CREATE OR REPLACE FUNCTION has_company_permission(claim text, company integer) RETURNS "bool"
    LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
    AS $$
    DECLARE
      claim_value integer[];
    BEGIN
      -- TODO: (current_setting('request.jwt.claims', true)::jsonb)->'app_metadata'->claim
      SELECT jsonb_to_integer_array(coalesce(raw_app_meta_data->claim, '[]')) INTO claim_value FROM auth.users WHERE id = auth.uid();
      IF claim_value IS NULL THEN
        return false;
      ELSIF 0 = ANY(claim_value::integer[]) THEN
        return true;
      ELSIF company = ANY(claim_value::integer[]) THEN
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