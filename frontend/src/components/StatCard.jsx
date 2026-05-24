export default function StatCard({

    title,
    value,
    color

}) {

    return (

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">

            <h2 className="text-zinc-400 text-xl mb-3">

                {title}

            </h2>

            <p className={`text-5xl font-bold ${color}`}>

                {value}

            </p>

        </div>

    )

}