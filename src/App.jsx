import AppRoutes from "./hooks/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { ConfirmProvider } from "./components/ConfirmProvider/ConfirmProvider";

function App() {
  return (
    <ErrorBoundary>
      <ConfirmProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={2800}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ConfirmProvider>
    </ErrorBoundary>
  );
}

export default App;
