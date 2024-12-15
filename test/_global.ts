import events from 'node:events'
import process from 'node:process'

export default function setup() {
  events.defaultMaxListeners = 20
  process.setMaxListeners(20)
}
