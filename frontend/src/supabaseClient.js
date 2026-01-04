// filepath: frontend/src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Usa variables de entorno para seguridad y flexibilidad
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializa el cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Puedes agregar aquí funciones utilitarias para trazabilidad o logging si lo necesitas
// Ejemplo:
// export function logSupabaseError(error) {
//   if (error) {
//     // Aquí puedes integrar con tu sistema de tracing/logging
//     console.error("Supabase error:", error);
//   }
// }