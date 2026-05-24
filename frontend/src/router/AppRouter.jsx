import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import Chats from "../pages/Chats"
import WhatsApp from "../pages/WhatsApp"
import Memory from "../pages/Memory"
import Settings from "../pages/Settings"

export default function AppRouter() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Dashboard />} />

                <Route path="/chats" element={<Chats />} />

                <Route path="/whatsapp" element={<WhatsApp />} />

                <Route path="/memory" element={<Memory />} />

                <Route path="/settings" element={<Settings />} />

            </Routes>

        </BrowserRouter>

    )

}