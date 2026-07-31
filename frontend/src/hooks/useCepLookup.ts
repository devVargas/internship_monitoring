import { useCallback, useRef, useState } from 'react'

export interface AddressData {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

export function useCepLookup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const lookup = useCallback(async (cep: string): Promise<AddressData | null> => {
    const digits = cep.replace(/\D/g, '')

    if (digits.length !== 8) return null

    if (timerRef.current) clearTimeout(timerRef.current)

    return new Promise((resolve) => {
      timerRef.current = setTimeout(async () => {
        setIsLoading(true)
        setError(null)

        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${digits}/json/`,
          )

          if (!response.ok) {
            throw new Error('Erro na requisição')
          }

          const data = await response.json()

          if (data.erro) {
            setError('CEP não encontrado')
            resolve(null)
          } else {
            resolve({
              logradouro: data.logradouro ?? '',
              bairro: data.bairro ?? '',
              localidade: data.localidade ?? '',
              uf: data.uf ?? '',
            })
          }
        } catch {
          setError('Erro ao buscar CEP')
          resolve(null)
        } finally {
          setIsLoading(false)
        }
      }, 400)
    })
  }, [])

  return { isLoading, error, lookup }
}
