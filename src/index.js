import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider, ReactReduxContext } from 'react-redux';
import './style.css';
import Chat from './components/chat';
import DrawZone from './components/DrawZone';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <div>
    <Chat />
    <DrawZone />
  </div>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
