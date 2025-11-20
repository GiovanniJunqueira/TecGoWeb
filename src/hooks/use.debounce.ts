import { useEffect, useState } from "react";

/**
 * Um hook para debounce de valores, útil para evitar requisições excessivas
 * quando o usuário está digitando ou realizando ações frequentes.
 *
 * @param value O valor que deve ser debounced
 * @param delay Tempo em milissegundos para aguardar entre mudanças
 * @returns O valor após o debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura o timer para atualizar o valor após o delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer caso o valor mude antes do tempo de debounce
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
