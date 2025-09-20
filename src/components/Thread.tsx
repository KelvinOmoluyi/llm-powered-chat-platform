

function Thread({day, text}: {day: string, text: string}) {
  return (
    <div>
        <h4 className="text-#[f8e709]">{day}</h4>
        <div className="h-13 w-full bg-[#22211c] rounded-[26px] mt-2 flex items-center pl-4 pr-8">
            <p className="line-clamp-1 text-[#acacac]">{text}</p>
        </div>
    </div>
  )
}

export default Thread