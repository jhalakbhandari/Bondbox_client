import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Flip, ToastContainer } from "react-toastify";
// import "./App.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastContainer
      position="top-center"
      autoClose={2000} // increased a bit for better UX
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Flip}
      toastClassName="dreamy-toast"
    />

    <App />
  </StrictMode>
);
