import Sidebar from "./Sidebar"

export default function MainLayout({ children }) {

    return (

        <div className="flex bg-black min-h-screen">

            <Sidebar />

            <div className="flex-1 p-10">

                {children}

            </div>

        </div>

    )

}