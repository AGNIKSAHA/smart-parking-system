import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./app/query-client";
import { store } from "./app/store";
import { AppRouter } from "./routes/router";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AppRouter />
        <Toaster position="top-right" />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
