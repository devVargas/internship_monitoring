import { useCallback, useEffect, useRef, useState } from 'react'

export interface AddressData {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

type ViaCepResponse = {
  erro?: boolean
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

export function useCepLookup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const lookup = useCallback(async (cep: string): Promise<AddressData | null> => {
    const digits = cep.replace(/\D/g, '')

    controllerRef.current?.abort()
    controllerRef.current = null

    if (digits.length !== 8) {
      setIsLoading(false)
      setError(null)
      return null
    }

    const controller = new AbortController()
    controllerRef.current = controller
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Erro na requisição')
      }

      const data = (await response.json()) as ViaCepResponse

      if (controllerRef.current !== controller) return null

      if (data.erro) {
        setError('CEP não encontrado')
        return null
      }

      if (!data.localidade || !data.uf) {
        throw new Error('Resposta inválida')
      }

      return {
        logradouro: data.logradouro ?? '',
        bairro: data.bairro ?? '',
        localidade: data.localidade,
        uf: data.uf,
      }
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === 'AbortError') {
        return null
      }

      if (controllerRef.current === controller) {
        setError('Erro ao buscar CEP')
      }

      return null
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  return { isLoading, error, lookup }
}
