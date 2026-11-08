import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import { WelcomePage } from './pages/WelcomePage'
import {
  DifficultyPage,
  GamePage,
  HomePage,
  IdentityPage,
  PrivateSpacePage,
  ProfilePage,
  ResumePage,
  SettingsPage,
  SplashPage,
} from './pages/Screens'
import './App.css'
import './Product.css'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="route-frame"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/difficulty" element={<DifficultyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/identity" element={<IdentityPage />} />
          <Route path="/space" element={<PrivateSpacePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AnimatedRoutes />
      </GameProvider>
    </BrowserRouter>
  )
}