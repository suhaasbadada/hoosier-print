import { NavLink, Routes, Route } from 'react-router-dom'
import { GeolocationProvider } from './hooks/useGeolocation'
import Home from './pages/Home'
import Guide from './pages/Guide'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">IU Print Finder</p>
          <h1>Hoosier Print</h1>
        </div>

        <div className="topbar-right">
          <nav className="topnav">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/guide">Guide</NavLink>
          </nav>

          <a
            href="https://mobile.print.iu.edu/myprintcenter/"
            target="_blank"
            rel="noreferrer noopener"
            className="topbar-action"
          >
            Open Print Center
          </a>
        </div>
      </header>

      <GeolocationProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
        </Routes>
      </GeolocationProvider>
    </div>
  )
}

export default App
