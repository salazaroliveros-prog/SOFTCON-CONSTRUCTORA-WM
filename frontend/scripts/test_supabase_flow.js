import supabase from './supabaseClient.node.js';

async function testSupabaseFlow() {
  // 1. Crear usuario de prueba
  const email = `testuser${Date.now()}@testmail.com`;
  const password = 'Test12345!';
  const nombre = 'Test User Flow';
  const { data: regData, error: regError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: nombre } }
  });
  if (regError) {
    console.error('Error al registrar usuario:', regError.message);
    return;
  }
  console.log('Usuario registrado:', regData.user?.email || regData);

  // 2. Login
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (loginError) {
    console.error('Error al iniciar sesión:', loginError.message);
    return;
  }
  console.log('Login exitoso:', loginData.session?.access_token);

  // 3. Insertar registro en tabla usuarios (si tienes permisos)
  // 4. Leer usuarios activos
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('id, username, email, rol, is_active');
  if (usuariosError) {
    console.error('Error al leer usuarios:', usuariosError.message);
    return;
  }
  console.log('Usuarios activos:', usuarios);
}

// Ejecutar flujo
await testSupabaseFlow();
