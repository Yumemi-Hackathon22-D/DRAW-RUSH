import React from 'react';
import { createRoot } from 'react-dom/client';
import {CookiesProvider} from 'react-cookie';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './style.css';
import Room from './components/Chat';
import  "./odaiLoader"

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <div>
    <CookiesProvider>
    <Room />

    </CookiesProvider>
  </div>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
