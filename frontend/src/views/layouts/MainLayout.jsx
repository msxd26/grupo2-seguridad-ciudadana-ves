import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cargando = <p className="page-loading container">Cargando…</p>

export default function MainLayout() {
  const { pathname } = useLocation()

  // Al cambiar de página, volver arriba.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Suspense fallback={cargando}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
