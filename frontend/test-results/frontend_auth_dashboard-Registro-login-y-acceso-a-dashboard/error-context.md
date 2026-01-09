# Page snapshot

```yaml
- generic [ref=e5]:
  - generic: M&S
  - generic [ref=e7]:
    - heading "INGRESA" [level=2] [ref=e9]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - text: Correo Electrónico
        - textbox [ref=e12]: testuser1767897822631@example.com
      - generic [ref=e13]:
        - text: Contraseña
        - textbox [ref=e14]: Test12345!
      - paragraph [ref=e15]: "Error: Credenciales inválidas o usuario no encontrado."
      - button "Iniciar Sesión" [ref=e16]
    - paragraph [ref=e18]:
      - text: ¿No tienes cuenta?
      - button "Regístrate" [ref=e19]
  - generic:
    - generic:
      - generic:
        - heading "Registro Maestro" [level=2]
      - generic:
        - generic:
          - text: Nombre Completo
          - textbox: Test User
        - generic:
          - text: Correo
          - textbox: testuser1767897822631@example.com
        - generic:
          - text: Contraseña
          - textbox: Test12345!
        - button "Finalizar Registro"
      - generic:
        - button "← Volver al Acceso"
```