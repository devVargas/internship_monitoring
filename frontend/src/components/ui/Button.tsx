import { Link } from 'react-router-dom';

function Button(props) {
    let className: string;
    if(props.color === "yellow")
        className = "inline-flex items-center justify-center gap-2 bg-yellow-600 hover:bg-transparent hover:text-yellow-600 border-2 border-transparent hover:border-yellow-600 text-white font-outfit font-semibold py-2 px-10 rounded-lg"
    else if(props.color === "white")
        className = "inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-500 border-2 border-white  text-neutral-500 hover:text-white font-outfit font-semibold py-2 px-10 rounded-lg"
    else
        className = "inline-flex items-center justify-center gap-2 bg-green-900 hover:bg-transparent hover:text-green-900 border-2 border-transparent hover:border-green-900 text-white font-outfit font-semibold py-2 px-10 rounded-lg"

    if(props.LinkTo) {
        return (<Link className={className} to={props.LinkTo} >{props.children ? props.children : props.text}</Link>);
    }
    else {
        return (<button className={className} type={props.type ? props.type : "button"} >{props.children ? props.children : props.text}</button>);
    }
}

export default Button;
