
function Button(props) {
    let className: string;
    if(props.color === "yellow")
        className = "bg-yellow-600 hover:bg-transparent hover:text-yellow-600 border-2 border-transparent hover:border-yellow-600 text-white font-outfit font-semibold py-2 px-10 rounded-lg"
    else
        className = "bg-green-900 hover:bg-transparent hover:text-green-900 border-2 border-transparent hover:border-green-900 text-white font-outfit font-semibold py-2 px-10 rounded-lg"

    return (<button className={className} type={props.type ? props.type : "button"} >{props.text}</button>);
}

export default Button;
