export const toast = {
  success: (m: string) => emit('success', m),
  error:   (m: string) => emit('error',   m),
  info:    (m: string) => emit('info',    m),
}

function emit(type: string, message: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('sc:toast', { detail: { type, message } }))
}
