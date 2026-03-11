import { supabaseAdmin } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";

async function addPost() {
  "use server";
  const { error } = await supabaseAdmin
    .from("contents")
    .insert({ isWatched: false, url: "https://deneme.com", type: "youtube" });
  console.log("error:", error);
  redirect("/");
}

export default async function Page() {
  return (
    <form action={addPost}>
      <button type="submit">Add Post</button>
    </form>
  );
}
