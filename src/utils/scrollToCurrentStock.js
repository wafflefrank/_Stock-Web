export function scrollToCurrentStock() {
  if (typeof window === 'undefined' || import.meta.env?.MODE === 'test') {
    return
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })
}
