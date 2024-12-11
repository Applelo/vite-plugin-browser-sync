import './style.css'

const form = document.getElementById('form') as HTMLFormElement | null

form?.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = new FormData(form)

  const firstname = data.get('firstname')
  const lastname = data.get('lastname')

  const message = `Hello ${firstname} ${lastname} !`
  const messageEl = document.getElementById('message')
  if (messageEl)
    messageEl.textContent = message
})
