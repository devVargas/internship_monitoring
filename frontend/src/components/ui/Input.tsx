export default function Input(props) {
   return (
        <>
    <input
        type={props.type ? props.type : "text" }
        className="w-full bg-input-bg font-outfit font-normal placeholder:text-input-text text-neutral-700 text-base rounded-md pl-3 pr-10 px-4 py-3 border border-input-border focus:outline-none focus:border-slate-400 hover:border-neutral-500"
        placeholder={props.placeholder}
        onChange={props.onChange}
        value={props.value}
    />
</>
  );
}

