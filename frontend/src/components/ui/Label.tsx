
export default function Label(props: { text: string }) {
    return (
        <label className="font-outfit text-neutral-900 text-left text-base pl-4">{props.text}</label>
    );
}
