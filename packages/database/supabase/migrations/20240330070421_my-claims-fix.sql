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