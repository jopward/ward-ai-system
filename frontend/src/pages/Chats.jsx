import { useEffect, useState, useRef } from "react"

import MainLayout from "../layout/MainLayout"

import api from "../services/api"

export default function Chats() {

    const [messages, setMessages] = useState([])

    useEffect(() => {

        api.get("/history")

            .then((res) => {

                setMessages(res.data)

            })

            .catch((err) => {

                console.log(err)

            })

        const interval = setInterval(() => {

            api.get("/history")

                .then((res) => {

                    setMessages(res.data)
                    setTimeout(() => {

                        chatEndRef.current?.scrollIntoView({
                            behavior: "smooth"
                        })

                    }, 100)

                })

        }, 3000)

        return () => clearInterval(interval)

    }, [])
    const [search, setSearch] = useState("")
    const groupedUsers = {}

    messages.forEach((msg) => {

        if (!groupedUsers[msg.user_id]) {

            groupedUsers[msg.user_id] = []

        }

        groupedUsers[msg.user_id].push(msg)

    })

    const [selectedUser, setSelectedUser] = useState(null)
    const chatEndRef = useRef(null)
    console.log(groupedUsers)
    return (

        <MainLayout>

            <h1 className="text-white text-5xl font-bold mb-10">

                Chats 💬

            </h1>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

                <div className="grid grid-cols-3 gap-5">

                    {Object.keys(groupedUsers).map((userId) => {

                        const userMessages = groupedUsers[userId]

                        const lastMessage =
                            userMessages[userMessages.length - 1]

                        return (

                            <div
                                key={userId}
                                onClick={() => setSelectedUser(userId)}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800 transition cursor-pointer"
                            >

                                <h2 className="text-cyan-400 text-xl font-bold mb-3">

                                    {userId}

                                </h2>

                                <p className="text-zinc-400 mb-3">

                                    Messages:
                                    {userMessages.length}

                                </p>

                                <p className="text-white line-clamp-2">

                                    {lastMessage.content}

                                </p>

                            </div>



                        )

                    })}

                </div>

                {selectedUser && (

                    <div className="mt-10 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

                        <h2 className="text-white text-3xl font-bold mb-6">

                            Chat with {selectedUser}

                        </h2>

                        <div className="flex flex-col gap-4">

                            {groupedUsers[selectedUser].map((msg, index) => (

                                <div
                                    key={index}
                                    className={`p-4 rounded-2xl max-w-[70%] w-fit ${msg.role === "user"
                                        ? "bg-cyan-600 self-start mr-auto"
                                        : "bg-zinc-800 self-end ml-auto"
                                        }`}
                                >

                                    <p className="text-sm text-zinc-300 mb-2">

                                        {msg.role}

                                    </p>

                                    <p className="text-white">

                                        {msg.content}

                                    </p>

                                    <p className="text-xs text-zinc-300 mt-2">

                                        {new Date(msg.created_at).toLocaleTimeString()}

                                    </p>

                                </div>

                            ))}
                            <div ref={chatEndRef}></div>

                        </div>

                    </div>

                )}

            </div>

        </MainLayout>

    )

}