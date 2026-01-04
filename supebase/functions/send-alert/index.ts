// supabase/functions/send-alert/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { record, table, type } = await req.json()

  let subject = ""
  let html = ""

  // Lógica para Sobre-costo
  if (type === 'SOBRECOSTO') {
    subject = `⚠️ ALERTA: Sobre-costo en Proyecto ${record.nombre}`
    html = `
      <h2>Alerta de Presupuesto - SOFTCON-MYS-CONSTRU-WM</h2>
      <p>El proyecto <strong>${record.nombre}</strong> ha excedido su presupuesto.</p>
      <ul>
        <li>Presupuesto: $${record.presupuesto_estimado}</li>
        <li>Costo Actual: $${record.costo_real}</li>
      </ul>
      <p>Eslogan: CONSTRUYENDO TU FUTURO</p>
    `
  }

  // Lógica para Abandono de Zona (GPS)
  if (type === 'GPS_ALERT') {
    subject = `🚨 ALERTA: Usuario fuera de zona de trabajo`
    html = `
      <h2>Alerta de Rastreo GPS</h2>
      <p>El usuario con ID <strong>${record.user_id}</strong> se ha movido fuera del rango permitido durante el horario laboral.</p>
      <p>Ubicación registrada: ${record.latitud}, ${record.longitud}</p>
    `
  }

  // Envío vía Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'alertas@tu-dominio.com',
      to: 'admin@tu-correo.com',
      subject: subject,
      html: html,
    }),
  })

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
})