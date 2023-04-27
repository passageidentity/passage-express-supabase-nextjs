DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.todos;

DROP POLICY IF EXISTS "Can view own user data." ON public.users;

DROP POLICY IF EXISTS "Can view own user data." ON public.todos;

DROP POLICY IF EXISTS "Can update own user data." ON public.users;

DROP POLICY IF EXISTS "Can update own user data." ON public.todos;

ALTER TABLE
    IF EXISTS ONLY public.users DROP CONSTRAINT users_id_fkey;

ALTER TABLE
    IF EXISTS ONLY public.todos DROP CONSTRAINT todos_user_id_fkey;

ALTER TABLE
    IF EXISTS ONLY public.users DROP CONSTRAINT users_pkey;

ALTER TABLE
    IF EXISTS ONLY public.todos DROP CONSTRAINT todos_pkey;

DROP TABLE IF EXISTS public.users;

DROP TABLE IF EXISTS public.todos;

DROP TRIGGER IF EXISTS on_auth_user_created ON next_auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user();

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--
CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ begin
insert into
    public.users (id, name, email, image)
values
    (new.id, new.name, new.email, new.image);

return new;

end;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

SET
    default_tablespace = '';

SET
    default_table_access_method = heap;

--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: next_auth; Owner: postgres
--
CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    ON next_auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--
-- Name: todos; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.todos (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    task text NOT NULL,
    is_complete boolean DEFAULT false NOT NULL,
    user_id uuid
);

ALTER TABLE
    public.todos OWNER TO postgres;

--
-- Name: todos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--
ALTER TABLE
    public.todos
ALTER COLUMN
    id
ADD
    GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.todos_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.users (
    id uuid NOT NULL,
    name text,
    email text,
    image text
);

ALTER TABLE
    public.users OWNER TO postgres;

--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE
    ONLY public.todos
ADD
    CONSTRAINT todos_pkey PRIMARY KEY (id);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE
    ONLY public.users
ADD
    CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Name: todos todos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE
    ONLY public.todos
ADD
    CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--
ALTER TABLE
    ONLY public.users
ADD
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

--
-- Name: todos Can update own user data.; Type: POLICY; Schema: public; Owner: postgres
--
CREATE POLICY "Can update own user data." ON public.todos FOR
UPDATE
    USING ((next_auth.uid() = user_id));

--
-- Name: users Can update own user data.; Type: POLICY; Schema: public; Owner: postgres
--
CREATE POLICY "Can update own user data." ON public.users FOR
UPDATE
    USING ((next_auth.uid() = id));

--
-- Name: todos Can view own user data.; Type: POLICY; Schema: public; Owner: postgres
--
CREATE POLICY "Can view own user data." ON public.todos FOR
SELECT
    USING ((next_auth.uid() = user_id));

--
-- Name: users Can view own user data.; Type: POLICY; Schema: public; Owner: postgres
--
CREATE POLICY "Can view own user data." ON public.users FOR
SELECT
    USING ((next_auth.uid() = id));

--
-- Name: todos Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--
CREATE POLICY "Enable insert for authenticated users only" ON public.todos FOR
INSERT
    WITH CHECK ((next_auth.uid() = user_id));

--
-- Name: todos; Type: ROW SECURITY; Schema: public; Owner: postgres
--
ALTER TABLE
    public.todos ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--
ALTER TABLE
    public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--
GRANT USAGE ON SCHEMA public TO postgres;

GRANT USAGE ON SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT USAGE ON SCHEMA public TO service_role;

--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--
GRANT ALL ON FUNCTION public.handle_new_user() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

--
-- Name: TABLE todos; Type: ACL; Schema: public; Owner: postgres
--
GRANT ALL ON TABLE public.todos TO anon;

GRANT ALL ON TABLE public.todos TO authenticated;

GRANT ALL ON TABLE public.todos TO service_role;

--
-- Name: SEQUENCE todos_id_seq; Type: ACL; Schema: public; Owner: postgres
--
GRANT ALL ON SEQUENCE public.todos_id_seq TO anon;

GRANT ALL ON SEQUENCE public.todos_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.todos_id_seq TO service_role;

--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--
GRANT ALL ON TABLE public.users TO anon;

GRANT ALL ON TABLE public.users TO authenticated;

GRANT ALL ON TABLE public.users TO service_role;