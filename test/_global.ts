import process from 'node:process'

export default function setup() {
  process.setMaxListeners(20)
}
