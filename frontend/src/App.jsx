import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './views/layouts/MainLayout'
import HomePage from './views/pages/HomePage'
import RutaProtegida from './views/components/RutaProtegida'

// Las páginas pesadas (gráficos, Leaflet, administración) se cargan bajo demanda.
const DashboardPage = lazy(() => import('./views/pages/DashboardPage'))
const MapaPage = lazy(() => import('./views/pages/MapaPage'))
const ReportarPage = lazy(() => import('./views/pages/ReportarPage'))
const ReportarFormularioPage = lazy(() => import('./views/pages/reportar/ReportarFormularioPage'))
const ReportarChatPage = lazy(() => import('./views/pages/reportar/ReportarChatPage'))
const ReportarGuiadoPage = lazy(() => import('./views/pages/reportar/ReportarGuiadoPage'))
const AlertasPage = lazy(() => import('./views/pages/AlertasPage'))
const ContactoPage = lazy(() => import('./views/pages/ContactoPage'))
const IngresarPage = lazy(() => import('./views/pages/IngresarPage'))
const MiCuentaPage = lazy(() => import('./views/pages/MiCuentaPage'))
const NotFoundPage = lazy(() => import('./views/pages/NotFoundPage'))

const AdminLayout = lazy(() => import('./views/layouts/AdminLayout'))
const AdminResumenPage = lazy(() => import('./views/pages/admin/AdminResumenPage'))
const AdminReportesPage = lazy(() => import('./views/pages/admin/AdminReportesPage'))
const AdminUsuariosPage = lazy(() => import('./views/pages/admin/AdminUsuariosPage'))

const cargando = <p className="page-loading container" role="status"><span className="spinner" aria-hidden="true" /> Cargando…</p>

export default function App() {
  return (
    <Suspense fallback={cargando}>
      <Routes>
        {/* Sitio público y área del ciudadano */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="mapa" element={<MapaPage />} />
          <Route path="reportar" element={<ReportarPage />} />
          <Route path="reportar/formulario" element={<ReportarFormularioPage />} />
          <Route path="reportar/chat" element={<ReportarChatPage />} />
          <Route path="reportar/guiado" element={<ReportarGuiadoPage />} />
          <Route path="alertas" element={<AlertasPage />} />
          <Route path="contacto" element={<ContactoPage />} />
          <Route path="ingresar" element={<IngresarPage />} />
          <Route path="mi-cuenta" element={<RutaProtegida><MiCuentaPage /></RutaProtegida>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Panel de administración */}
        <Route path="admin" element={<RutaProtegida rol="admin"><AdminLayout /></RutaProtegida>}>
          <Route index element={<AdminResumenPage />} />
          <Route path="reportes" element={<AdminReportesPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
