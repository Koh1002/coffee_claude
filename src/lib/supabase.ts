import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase not configured, skipping image upload");
    return null;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("coffee-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("coffee-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteImage(photoUrl: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  // Extract file path from URL
  const urlParts = photoUrl.split("/coffee-photos/");
  if (urlParts.length !== 2) {
    return false;
  }

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from("coffee-photos")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image:", error);
    return false;
  }

  return true;
}
