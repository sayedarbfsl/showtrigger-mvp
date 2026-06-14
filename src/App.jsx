import React from 'react'
import BroadcastHeader from './components/BroadcastHeader'
import LayersSidebar from './components/LayersSidebar'
import SongGrid from './components/SongGrid'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import './App.css'

export default function App() {
  useKeyboardShortcuts()

  return (
    <div className="app">
      <BroadcastHeader />
      <div className="main-layout">
        <LayersSidebar />
        <SongGrid />
      </div>
    </div>
  )
}