import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Dashboard from "@/pages/Dashboard";
import QuizBuilder from "@/pages/QuizBuilder";
import StudyBuddy from "@/pages/StudyBuddy";
import LanguageTutor from "@/pages/LanguageTutor";
import History from "@/pages/History";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="quiz" element={<QuizBuilder />} />
            <Route path="study" element={<StudyBuddy />} />
            <Route path="language" element={<LanguageTutor />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;