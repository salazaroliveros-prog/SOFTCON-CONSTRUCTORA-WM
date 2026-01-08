import supabase from "./supabaseClient.js";

async function createTestUser() {
  const email = "testuser_e2e@example.com";
  const password = "Test12345!";
  const nombre = "Test User E2E";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: nombre } }
  });
  if (error) {
    console.error("Error creando usuario de prueba:", error.message);
    process.exit(1);
  }
  console.log("Usuario de prueba creado:", data.user?.email || data);
}

createTestUser();
