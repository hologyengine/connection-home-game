import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerWorker } from '@hology/core'
import Worker from './hology.worker.ts?worker'


function addPokiEventListeners() {
  window.addEventListener('keydown', ev => {
    if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
      ev.preventDefault();
    }
  });
  window.addEventListener('wheel', ev => ev.preventDefault(), { passive: false });
}

function init() {
  registerWorker(() => new Worker())
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

if (__POKI__) {
  console.log('Try init with Poki')
  PokiSDK.init()
    .then(() => {
      console.log("Poki SDK successfully initialized");
    })
    .catch(() => {
      console.log("Initialized, something went wrong, load your game anyway");
    })
    .finally(() => {
      addPokiEventListeners();
      init();
    });
} else {
  init()
}