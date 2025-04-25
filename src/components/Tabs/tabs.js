
const Tabs = (props) => {
    return (
        <>
            {
                props.tabs_heading.map((item, index) => {
                    return (
                        <div key={index + 1}>
                            {
                                item.selected == true ?
                                    <>
                                        <button onClick={() => {
                                            props.action(item.id)
                                        }} key={index} className="flex-grow p-4 bg-gradient-to-r from-[#7DE143] to-[#055938] text-white">{item.value}</button>
                                    </>
                                    :
                                    <>
                                        <button onClick={() => {
                                            props.action(item.id)
                                        }} key={index} className="flex-grow p-4">{item.value}</button>
                                    </>
                            }

                        </div>
                    )
                })
            }
        </>
    )
}


export default Tabs