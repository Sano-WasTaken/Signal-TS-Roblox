class Signal<K extends any[], T extends (...args: K) => void> {
	callbacks: thread[]

	constructor() {
		this.callbacks = []
	}

	public Fire(...args: unknown[]) {
		this.callbacks.forEach((thread) => {
			coroutine.resume(thread, ...args)
		})
	}

	public Connect(callback: T) {
		const thread = coroutine.create(callback)

		const id = this.callbacks.push(thread)

		const connection = new Connection(thread, this, id)

		return connection
	}

	public Once(callback: T) {
		const thread = coroutine.create((...args: K) => {
			coroutine.close(thread)
			callback(...args)
		})

		const id = this.callbacks.push(thread)

		return new Connection(thread, this, id)
	}
}

class Connection<K extends any[], T extends (...args: K) => void> {
	private thread: thread
	private signal: Signal<K, T>
	private id: number

	constructor(thread: thread, signal: Signal<K, T>, id: number) {
		this.thread = thread
		this.signal = signal
		this.id = id
	}

	public Disconnect() {
		this.signal.callbacks.remove(this.id)

		return this
	}

	public Reconnect() {
		const id = this.signal.callbacks.push(this.thread)

		this.id = id

		return this
	}
}

export = Signal
