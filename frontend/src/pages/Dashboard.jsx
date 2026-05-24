import { useEffect, useState } from "react"

import MainLayout from "../layout/MainLayout"

import api from "../services/api"

import StatCard from "../components/StatCard"

export default function Dashboard() {

    const [history, setHistory] = useState([])

    const [status, setStatus] = useState({})

    useEffect(() => {

        api.get("/history")

            .then((res) => {

                console.log(res.data)

                setHistory(res.data)

            })

            .catch((err) => {

                console.log(err)

            })

        api.get("/status")

            .then((res) => {

                setStatus(res.data)

            })

    }, [])

    return (

        <MainLayout>

            <h1 className="text-white text-5xl font-bold mb-10">

                Dashboard 😎

            </h1>

            <div className="grid grid-cols-3 gap-5">

                <StatCard
                    title="Messages"
                    value={history.length}
                    color="text-cyan-400"
                />

                <StatCard
                    title="AI Status"
                    value={status.ai}
                    color="text-green-400"
                />

                <StatCard
                    title="WhatsApp"
                    value={status.whatsapp}
                    color="text-pink-400"
                />

            </div>

            <div className="mt-10 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

                <h2 className="text-white text-2xl font-bold mb-5">

                    Latest Chats

                </h2>

                <div className="flex flex-col gap-4">

                    {history.slice(0, 5).map((msg, index) => (

                        <div
                            key={index}
                            className="bg-zinc-950 p-4 rounded-xl border border-zinc-800"
                        >

                            <p className="text-cyan-400 mb-2">

                                {msg.role}

                            </p>

                            <p className="text-white">

                                {msg.content}

                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </MainLayout>

    )

}