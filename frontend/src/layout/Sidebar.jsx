import { Link } from "react-router-dom"

export default function Sidebar() {

    return (

        <div className="w-64 bg-zinc-950 border-r border-zinc-800 h-screen p-5">

            <h1 className="text-cyan-400 text-3xl font-bold mb-10">
                Ward AI
            </h1>

            <div className="flex flex-col gap-4">

                <Link
                    to="/"
                    className="text-white hover:text-cyan-400 transition"
                >
                    Dashboard
                </Link>

                <Link
                    to="/chats"
                    className="text-white hover:text-cyan-400 transition"
                >
                    Chats
                </Link>

                <Link
                    to="/whatsapp"
                    className="text-white hover:text-cyan-400 transition"
                >
                    WhatsApp
                </Link>

                <Link
                    to="/memory"
                    className="text-white hover:text-cyan-400 transition"
                >
                    Memory
                </Link>

                <Link
                    to="/settings"
                    className="text-white hover:text-cyan-400 transition"
                >
                    Settings
                </Link>

            </div>

        </div>

    )

}