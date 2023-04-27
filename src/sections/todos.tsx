import { SupabaseClient } from "@supabase/supabase-js";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useSession } from "next-auth/react"

export interface ITodo {
  is_complete: boolean;
  id: number;
  task: string;
}

export default function Todos() {
  const { data: session } = useSession()
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [todos, setTodos] = useState<ITodo[] | null>(null);
  const newTaskTextRef = useRef<HTMLInputElement>(null);
  const [errorText, setError] = useState<string | null>("");

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: todos, error } = await supabaseClient!.from("todos")
        .select("*")
        .order("id", { ascending: false });

      return todos as ITodo[];
    };

    if (!supabaseClient && session?.supabaseAccessToken) {
      const client = supabase(session!.supabaseAccessToken);
      setSupabaseClient(client);
    }

    if (supabaseClient) fetchTodos().then((todos) => setTodos(todos)).catch(console.error);
  }, [session, supabaseClient]);

  const Todo = ({ todo }: { todo: ITodo }) => {
    const [isComplete, setIsComplete] = useState<boolean>(todo.is_complete);

    const toggleCompleted = async () => {
      const { data, error } = await supabaseClient!
        .from("todos")
        .update({ is_complete: !isComplete })
        .eq("id", todo.id)
        .select()
        .single();

      if (error) {
        console.log("error", error);
        return;
      } else {
        setIsComplete(!isComplete);
      }
    };

    return (
      <div>
        <input className="hidden" type="checkbox" checked={isComplete} onChange={toggleCompleted} id={todo.id.toString()} />
        <label className="flex items-center h-10 px-2 rounded cursor-pointer hover:bg-gray-900" htmlFor={todo.id.toString()}>
          <span className="flex items-center justify-center w-5 h-5 text-transparent border-2 border-gray-500 rounded-full">
            <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="ml-4 text-sm">{todo.task}</span>
        </label>
      </div>
    );
  }

  const addTodo = async () => {
    let taskText = newTaskTextRef.current!.value;
    let task = taskText.trim();
    if (task.length <= 3) {
      setError("Task length should be more than 3 characters");
    } else {

      let { data, error } = await supabaseClient!
        .from("todos")
        .insert({ task, user_id: session?.user.id })
        .select()
        .single();
      if (error) setError(error.message);
      else {
        let todo = data as ITodo;
        setTodos([todo, ...todos!]);
        newTaskTextRef.current!.value = "";
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center w-screen h-screen font-medium">
        <div className="flex flex-grow items-center justify-center bg-gray-900 h-full">
          <div className="max-w-full p-8 bg-gray-800 rounded-lg shadow-lg w-96 text-gray-200">
            <div className="flex items-center mb-6">
              <svg className="h-8 w-8 text-indigo-500 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h4 className="font-semibold ml-3 text-lg">{session?.user.name} Favorite Foods</h4>
            </div>
            {!todos ? <div>Loading</div> : todos?.map((todo) => <Todo todo={todo} key={todo.id} />)}
            <button className="flex items-center w-full h-8 px-2 mt-2 text-sm font-medium rounded">
              <svg className="w-5 h-5 text-gray-400 fill-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={addTodo}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <input
                className="flex-grow h-8 ml-4 bg-transparent focus:outline-none font-medium"
                type="text"
                placeholder="add a new task"
                ref={newTaskTextRef}
                onKeyUp={(e) => e.key === "Enter" && addTodo()}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
