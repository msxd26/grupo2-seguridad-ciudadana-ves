import 'dotenv/config'

const isProd = process.env.NODE_ENV === 'production'

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET debe estar definido (mínimo 32 caracteres) en producción')
}

export const env = {
  isProd,
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'seguridad_ves',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'solo-desarrollo-cambiar-en-produccion-0000',
    sesionDias: Number(process.env.SESION_DIAS ?? 7),
  },
  admin: {
    nombre: process.env.ADMIN_NOMBRE ?? 'Administrador',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
}
