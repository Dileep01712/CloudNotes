import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import Alert from './components/feedback/Alert';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Trash from './components/pages/Trash';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsOfUse from './components/pages/TermsOfUse';
import { NoteProvider } from "./context/NoteProvider";
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/useAuth';

interface AlertType {
  msg: string;
  type: "success" | "danger" | "warning" | "info";
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signout } = useAuth();
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [mode, setMode] = useState<"note" | "folder" | "folderView">(
    location.pathname.startsWith("/f/") ? "folderView" : "note"
  );

  const showAlert = (
    msg: string,
    type: "success" | "danger" | "warning" | "info"
  ) => {
    setAlert({ msg: msg, type });
  };

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  useEffect(() => {
    const handleLogout = (event: CustomEvent) => {
      const message = event.detail?.message || 'Your session has expired. Please log in again.';

      signout();
      navigate("/signin");
      setAlert({ msg: message, type: 'warning' });
    };

    window.addEventListener("auth:signout", handleLogout as EventListener);
    return () => window.removeEventListener("auth:signout", handleLogout as EventListener);
  }, [signout, navigate]);

  return (
    <NoteProvider>
      <div className="min-h-screen text-black bg-zinc-100">
        <div className="sticky top-0 z-50 bg-zinc-100 px-4 sm:px-5 md:px-6 lg:px-0">
          <Navbar mode={mode} setMode={setMode} showAlert={showAlert} />
          <Alert alert={alert} onClose={closeAlert} autoHideDuration={5000} />
        </div>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-5 md:p-6 lg:p-0">
          <Routes>
            <Route element={<ProtectedRoute requireAuth={true} />}>
              <Route
                path='/:directoryId?'
                element={<Home showAlert={showAlert} mode={mode} setMode={setMode} />}
              />

              <Route
                path='/f/:folderId'
                element={<Home showAlert={showAlert} mode={mode} setMode={setMode} />}
              />
              <Route path='/trash' element={<Trash showAlert={showAlert} />} />
            </Route>

            <Route element={<ProtectedRoute requireAuth={false} />}>
              <Route path='/signin' element={<SignIn showAlert={showAlert} />} />
              <Route path='/signup' element={<SignUp showAlert={showAlert} />} />
              <Route path="/forgot-password" element={<ForgotPassword showAlert={showAlert} />} />
            </Route>

            <Route path='/about' element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
          </Routes>
        </main>
      </div>
    </NoteProvider>
  );
}

export default App;