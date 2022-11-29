import { useState } from "react";

export function useForm<T>() {
  const [formState, setState] = useState<T>({} as T);
  const register = (name: string) => ({
    value: formState[name as keyof T] || "",
    onChange: (e: any) => setState((s) => ({ ...s, [name]: e.target.value })),
  });
  const handleSubmit = (fn: (v: T) => void) => (e: any) => (
    e.preventDefault(), fn(formState)
  );
  const reset = () => setState({} as T);
  return { register, handleSubmit, formState, reset };
}
