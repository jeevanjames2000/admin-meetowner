
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

import store from "./store/store.ts";
import { Provider } from 'react-redux'
import React from "react";

createRoot(document.getElementById("root")!).render(
  
  <React.StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <Provider store={store}>
          <App/>
        </Provider>
        
      </AppWrapper>
    </ThemeProvider>
  </React.StrictMode>,
  
);
