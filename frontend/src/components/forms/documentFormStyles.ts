export function selectClass(error?: string | null) {
  const border = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
    : 'border-neutral-300 hover:border-neutral-400 focus:border-green-800 focus:ring-green-100'
  return `w-full rounded-lg border bg-white px-3.5 py-3 text-neutral-900 outline-none transition focus:ring-4 ${border}`
}
